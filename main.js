// ==UserScript==
// @name         HTML Validator v2
// @namespace    http://atida.com/
// @version      0.2
// @description  try to take over the world!
// @author       Miguel Angel
// @match        *://staging.mifarma.es/suadmin/cms/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @require      https://raw.githubusercontent.com/miguelean/html-validator/main/main.js
// @downloadURL  https://raw.githubusercontent.com/miguelean/html-validator/main/main.js
// @updateURL    https://raw.githubusercontent.com/miguelean/html-validator/main/main.js
// @grant        none
// ==/UserScript==

;(function () {
  'use strict'

  const getHtmlError = html => {
    console.log('Me he Actualizado!')
    const parser = new DOMParser()
    const htmlForParser = `<xml>${html}</xml>`
      .replaceAll(/(src|href)=".*?&.*?"/g, '$1="OMITTED"')
      .replaceAll(/<script[\s\S]+?<\/script>/gm, '<script>OMITTED</script>')
      .replaceAll(/<style[\s\S]+?<\/style>/gm, '<style>OMITTED</style>')
      .replaceAll(/<pre[\s\S]+?<\/pre>/gm, '<pre>OMITTED</pre>')
      .replaceAll(/&nbsp;/g, '&#160;')
      .replaceAll(/(?:^|(?<= ))([^=<>\s"']+)(?:(?= )|\s|$)/gm, '')
      .replaceAll(/{{[\s\S]+?}}/gm, match => match.replace(/"/g, "'"))
      .replaceAll(':', 'data.')
      .replaceAll('@', '')

    const doc = parser.parseFromString(htmlForParser, 'text/xml')
    const validator = document.getElementById('html-validator')
    if (doc.documentElement.querySelector('parsererror')) {
      validator.setAttribute(
        'style',
        `
            position: absolute;
            width: 28px;
            height: 28px;
            top: 0;
            right: 0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            background: red;
            transition-duration: 200ms;
            border: 2px solid #ffffff;
            box-shadow: 0 0 6px rgba(255, 0, 0, 0.5);
            cursor: default;
            `
      )
      validator.setAttribute(
        'title',
        doc.documentElement.querySelector('parsererror').querySelector('div')
          .innerText
      )
      validator.innerText = '✕'
      return true
    } else {
      validator.setAttribute(
        'style',
        `
            position: absolute;
            width: 28px;
            height: 28px;
            top: 0;
            right: 0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            background: green;
            transition-duration: 200ms;
            border: 2px solid #ffffff;
            box-shadow: 0 0 6px rgba(0, 255, 0, 0.5);
            cursor: default;
            `
      )
      validator.setAttribute('title', 'No errors')
      validator.innerText = '✔'
      return false
    }
  }

  const waitForElm = selector => {
    let type
    if (document.location.pathname.includes('/cms/block/edit/block_id')) {
      type = 'block'
    }
    if (document.location.pathname.includes('/cms/page/edit/page_id')) {
      type = 'page'
    }
    return new Promise(resolve => {
      if (document.getElementById(`cms_${type}_form_content`)) {
        return resolve(document.getElementById(`cms_${type}_form_content`))
      }

      const observer = new MutationObserver(mutations => {
        if (document.getElementById(`cms_${type}_form_content`)) {
          resolve(document.getElementById(`cms_${type}_form_content`))
          observer.disconnect()
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true
      })
    })
  }

  waitForElm('cms_block_form_content').then(elm => {
    const container = elm.parentElement
    container.setAttribute('style', 'position: relative;')
    const validator = document.createElement('div')
    validator.setAttribute('id', 'html-validator')
    container.appendChild(validator)
    getHtmlError(elm.value)
    elm.addEventListener('input', value => getHtmlError(value.target.value))
  })
})()
