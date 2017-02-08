'use strict';

/**
 * Module dependencies.
 */
var co = require('co');
var copy = require('copy-to');
var path = require('path');
var fs = require('co-fs');
var ejs = require('ejs');
var Chinese = require('chinese-s2t');
/**
 * default render options
 * @type {Object}
 */
var defaultSettings = {
  cache: false,
  layout: 'layout',
  viewExt: 'html',
  locals: {},
  debug: false,
  writeResp: true,
  isZht: false
};

/**
 * set app.context.render
 *
 * usage:
 * ```
 * yield *this.render('user', {name: 'dead_horse'});
 * ```
 * @param {Application} app koa application instance
 * @param {Object} settings user settings
 */
exports = module.exports = function(app, settings) {
  if (app.context.render) {
    return;
  }

  if (!settings || !settings.root) {
    throw new Error('settings.root required');
  }

  settings.root = path.resolve(process.cwd(), settings.root);

  /**
   * cache the generate package
   * @type {Object}
   */
  var cache = Object.create(null);

  copy(defaultSettings).to(settings);


  settings.viewExt = settings.viewExt ? '.' + settings.viewExt.replace(/^\./, '') : '';

  /**
   * generate html with view name and options
   * @param {String} view
   * @param {Object} options
   * @return {String} html
   */
  function* render(view, options) {
    view += settings.viewExt;
    var viewPath = path.join(settings.root, view);
    // var delimiter = options.delimiter || '%';
    // get from cache
    if (settings.cache && cache[viewPath]) {
      return cache[viewPath].call(options.scope, options);
    }
    var tpl = yield fs.readFile(viewPath, 'utf8');

    /**
     * 不修改ejs原生模板,进行外部script type处理
     * 转换所有<script data="123" type="text/ejs-template"> </script>中的ejs
     */

    var _Delimiter = settings.delimiter ? settings.delimiter : '%';
    var RegIgnore = /<script\b[^>]*type="text\/ejs-template"[^>]*>([\s\S]*?)<\/script>/gm;
    var _replaceTagReg = new RegExp('<' + _Delimiter, 'gm');
    var _replaceDoubleTagReg = new RegExp('<' + _Delimiter + _Delimiter + _Delimiter, 'gm');
    var _insideEjsLang = tpl.match(RegIgnore);

    //只有script标签存在的时候才进行处理
    if (!!_insideEjsLang && _insideEjsLang.length > 0) {

      var i = 0;
      for (i; i < _insideEjsLang.length; i++) {
        var _thisUpdateEjs = _insideEjsLang[i].replace(_replaceTagReg, '<' + _Delimiter + _Delimiter);
        // 将 text/ejs-template 内容中的 '<%%%' 替换成 '<%', 后续由 ejs 编译
        var output = _thisUpdateEjs.replace(_replaceDoubleTagReg, '<' + _Delimiter);
        tpl = tpl.replace(_insideEjsLang[i], output);
      }
    }


    var fn = ejs.compile(tpl, {
      filename: viewPath,
      _with: settings._with,
      compileDebug: settings.debug,
      delimiter: settings.delimiter
    });

    if (settings.cache) {
      cache[viewPath] = fn;
    }
    return fn.call(options.scope, options);
  }


  app.context.render = function*(view, _context) {
    var context = {};
    merge(context, this.state);
    merge(context, _context);

    try {
      var html = yield * render(view, context);
    } catch (e) {
      throw new Error('模板渲染出错:\n ' + e)
      console.log(e);
    }



    var layout = context.layout === false ? false : (context.layout || settings.layout);
    if (layout) {
      context.body = html;
      html = yield * render(layout, context);
    }

    var isZht = context.Zht === false ? false : (context.isZht || settings.isZht);

    if (isZht) {
      html = html = Chinese.s2t(html);
    }



    var writeResp = context.writeResp === false ? false : (context.writeResp || settings.writeResp);
    if (writeResp) {
      this.type = 'html';
      this.body = html;
    } else {
      //only return the html
      return html;
    }
  };
};

/**
 * Expose ejs
 */

exports.ejs = ejs;

/**
 * merge source to target
 *
 * @param {Object} target
 * @param {Object} source
 * @return {Object}
 * @api private
 */
function merge(target, source) {
  for (var key in source) {
    target[key] = source[key];
  }
}