//Umethod Utils
//Author: Bryce Leue
//License: GPLv2
//A collection of utilities for working with the bootscore theme for wordpress
//Dependencies (include before this file is included):
//breakpoints.js
//jQuery



//////Globals///////


//need global for storing the height of the navbar so theme.js can access it, currently set to bootscore default
//this gets automatically changed based on changes to the header
if(typeof UMNavH == "undefined") {
  var UMNavH = 55;
}

//Wrapper///////////
var umUtils = typeof umUtils == "undefined" ? (function($) {
  'use strict';
  ///////////////////////////////////
  //polyfills

  //Array.forEach
  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function forEach (callback, thisArg) {
      if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
      }
      var array = this;
      thisArg = thisArg || this;
      for (var i = 0, l = array.length; i !== l; ++i) {
        callback.call(thisArg, array[i], i, array);
      }
    };
  }

  //Object.entries
  if (!Object.entries) {
    Object.entries = function( obj ){
      var ownProps = Object.keys( obj ),
          i = ownProps.length,
          resArray = new Array(i); // preallocate the Array
      while (i--)
        resArray[i] = [ownProps[i], obj[ownProps[i]]];

      return resArray;
    };
  }
  //Array.includes
  if (!Array.prototype.includes) {
	   Array.prototype.includes = function(searchElement, from) {
       if (typeof from == 'undefined') { from = 0; }
       var result = this.indexOf(searchElement, from);
       return result == -1 ? false : true;
     };
  }
  //end polyfills
  /////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////////////////
  //UmUtils//////////////////////////////////////////////////////////////////////////////////
  var UMu = {};


  //umUtils.on///////////////////////////
  //Wrapper for addEventListener
  //allows use of anonymous functions and functions with params for removeEventListener after it fires
  //pass true to remove for this behavior
  UMu.on = function(element, evt, func, params, remove) {
    if(typeof remove == 'undefined') remove = false;
    params = (typeof params == 'undefined' || !Array.isArray(params) && typeof params != "string") ?
      null : Array.isArray(params) ? params : [params];
    var funcname = (func.name == "" ? 'umAnonFunc' : func.name)+UMu.anonCounter;
    UMu.anonCounter++;
    UMu.funcs[funcname] = buildFunc(element, evt, func, funcname, params, remove);

    element.addEventListener(evt, UMu.funcs[funcname]);
  }

  function buildFunc(element, evt, func, funcname, params, remove) {
    return remove ? function() {
      func.apply(null, params);
      element.removeEventListener(evt, UMu.funcs[funcname]);
      delete UMu.funcs[funcname];
    } : function() {func.apply(null, params)};
  }

  UMu.funcs = {};
  UMu.anonCounter = 1;


  //umUtils.scrollspy///////////////////////////
  //activate scrollspy for page by id and target specific element
  //place page id's and corresponding section ids you want to activate it for in the pages array
  //format: {int pageidnum:[string '#sectionid']}
  //var scrollSpy = umUtils.scrollspy(pagesarr) in document ready to initialize
  //recommend wrapping pages in another function in your code
  //limited to one target per page
  //example:
  //function scrollspypages() {
  //  return [
  //    {
  //      5: '#bootscore-navbar',
  //      6: '#new-page-nav'
  //    }
  //  ];
  //}
  //call like this: var scrollspy = umUtils.scrollSpy(scrollspypages());
  UMu.scrollspy = function(pages) {
    var scrollSpy;
    var pageidentified=false;
    if(pages.length) {
      pages.forEach(function(page) {
        for(const [id, section] of Object.entries(page)) {
          if($(".page-id-"+id).length) {
            scrollSpy = scrollspy(section, UMNavH + 1);
            pageidentified = true;
            break;
          }
          if(pageidentified) break;
        }
      });
    }

  }
  function scrollspy(target, offset) {
    var scrollSpy = bootstrap.ScrollSpy.getOrCreateInstance(document.body, {
      target: target,
      offset: offset
    });
    return scrollSpy;
  }


  //umUtils.navHeight//////////////////////////
  //dynamically update navheight in theme.js
  //usage: call umUtils.navHeight(string '#headerid') in document ready
  //Notes: this depends on events created by umUtils.bpc
  UMu.navHeight = function(headerid) {
    if(!$(headerid).length) return;

    storeHeight(headerid);
    window.addEventListener("umAfterResize", function() {
      storeHeight(headerid);
    });
  }
  function storeHeight(headerid) {
    UMNavH=$(headerid).height();
  }


  //umUtils.detectVis///////////////////////////
  //Detect browser window/tab visibility///////////
  UMu.detectVis = function() {
    return detectVis();
  }
  function detectVis() {
    return document.hidden ? false : true;
  }

  //umUtils.onVisible///////////////////////////
  //trigger function when page is visible
  //params is type array
  UMu.onVisible = function(func, params, remove) {
    UMu.on(document, 'visibilitychange', func, params, remove);
  }




  //umUtils.uniHeight////////////////////////
  //set heights of multiple child elements equal to the tallest element
  //usage: call umUtils.uniHeight(string parentelementselector, string childelementselector)
  //Notes: this depends on events created by umUtils.bpc
  //pass true to animate to enable css transition of .3s
  //pass specific breakpoints as array or omit to include for all
  //ex ['xs', 'sm'] to only fire on xs and sm
  //FIXME: add warning for when the child is a flex element (flex seems to break this)
  UMu.uniHeight = function(parent, child, animate, breakpoints) {
    if(typeof animate != 'undefined' && animate) {
      animate = true;
    } else {
      animate = false;
    }
    if(typeof breakpoints == 'undefined') {
      breakpoints = true;
    }
    var selectors = parent+' '+child;
    if(!$(parent).length) return;

    window.addEventListener("umBeforeResize", function() {
        clearHeights(selectors);
        enableTransition(selectors);
    });
    window.addEventListener("umAfterResize", function() {
      assignHeights(selectors, breakpoints);
    });

    //attempt to set the heights when dom is ready
    //if the tab loads when it isnt visible this can cause unexpected behavior
    //so we use visibility api to deal with this
    if(!detectVis()) {
      UMu.onVisible(assignHeights, [selectors, breakpoints], true);
    } else {
      assignHeights(selectors, breakpoints);
    }

  }
  //animate changes
  function enableTransition(selectors) {
    $(selectors).each(function() {
      UMu.on(this, 'transitionend', clearTransition, selectors, true);
      $(this).css("transition", "height .3s");
    });
  }
  //FIXME: bootstrap transitions are breaking XD
  function clearTransition(selectors) {
      $(selectors).each(function() {
        $(this).css("transition", "");
      });
  }
  function getHeight(selectors) {
    var height = 0;
    $(selectors).each(function() {
      height = $(this).height() > height ? $(this).height() : height;
    });
    return height;
  }
  //use assignHeights when you want to safely target specific breakpoints
  //if breakpoint is not matched but height is still defined in style, remove it
  function assignHeights(selectors, breakpoints) {
    var bp = typeof(breakpoints) == 'boolean' ? true : checkBP(breakpoints);
    if(bp) {
      setHeights(selectors);
    } else {
      clearHeights(selectors);
    }
  }
  function setHeights(selectors) {
    $(selectors).each(function() {
      $(this).css("height", $(this).height());
    });
    $(selectors).each(function() {
      $(this).css("height", getHeight(selectors)+"px");
    });
  }
  function clearHeights(selectors) {
    $(selectors).each(function() {
      $(this).css("height", "auto");
    });
  }

  //umUtils.triggerClick///////////////////////
  //trigger click on target when clicked
  //example use case: one pager with content blocks inside of a carousel need to be targeted with links on
  //a different part of the page
  //usage: add data-umethod-targetClick = "targetid" to the source element in your markup (do not include '#')
  //ex: <a href="#targetid" data-umethod-targetClick="umpcsbutton">
  UMu.triggerClick = function() {
    var elms = document.querySelectorAll("[data-umethod-targetClick]");
    if(!elms.length) return;
    if(elms.length) {
      elms.forEach(function(elm) {
        elm.addEventListener("click", function(){
          try {
            document.getElementById(elm.getAttribute("data-umethod-targetClick")).click();
          } catch(error) {
            console.error(error+" --It is possible you are not targeting a clickable element with: "+elm.getAttribute("data-umethod-targetClick"));
          }
        }, false);
      });
    }
  }

  //umUtils.cnb///////////////////////
  //ensure "active" class is changed accordingly if you use buttons to navigate a bootstrap carousel
  //detects when carousel has "slid" and uses the active element to determine which button to set to active
  //usage: pass ID of button container and call in document ready
  //ex:
  UMu.cnb = function(navid) {
    var navElms =  document.querySelectorAll("#"+navid+" .btn");
    if(!navElms.length) return;
    var carousel = document.getElementById(navElms[0].getAttribute("data-bs-target").slice(1));
    carousel.addEventListener('slide.bs.carousel', function(evt){
      setcnbClass(navElms, evt.to);
    });
  }
  function setcnbClass(navElms, index) {
    $(navElms).each(function(){
      if(parseInt(this.getAttribute("data-bs-slide-to")) === index) {
        $(this).addClass("active");
      } else {
        if($(this).hasClass("active")) $(this).removeClass("active");
      }
    });
  }

  //umUtils.bpE////////////////////////
  //Breakpoint events
  //depends on breakpoints.js
  //once a breakpoint is met, trigger a 800ms timer to check for changes in the window size
  //Create events umBeforeResize and umAfterResize on either side of the timer
  //this ostensibly detects when the user has begun and stopped resizing by triggering the second event
  //when the window size matches before and after the timer
  //useful for enabling responsive features to function more reliably when the user is resizing the window
  //usage: initialize this before using any of the other utilities
  //TODO: Breakpoints are currently hardcoded according to bs spec - try to grab them programmatically
  UMu.bpe = {}
  UMu.bpe.before = new Event("umBeforeResize");
  UMu.bpe.after = new Event("umAfterResize");
  UMu.bpe.w = 0; UMu.bpe.h = 0;
  UMu.bpe.lws = [0,0];
  UMu.bpe.timedOut = false;
  UMu.bpe.pageloaded = false;
  UMu.bpe.afterFired = -1;
  UMu.bpe.breakpoints = ['sm','md','lg','xl','xxl'];
  UMu.bpE = function() {
    Breakpoints({
      xs: {
        min: 0,
        max: 575
      },
      sm: {
        min: 576,
        max: 767
      },
      md: {
        min: 768,
        max: 991
      },
      lg: {
        min: 992,
        max: 1199
      },
      xl: {
        min: 1200,
        max: 1399
      },
      xxl: {
        min: 1400,
        max: Infinity
      }
    });
    UMu.bpe.breakpoints.forEach(function(element) {
      Breakpoints.on(element, "enter", checkResizing);
      Breakpoints.on(element, "leave", checkResizing);
    });
  }
  function windowhw() {
    UMu.bpe.h = $(window).height();
    UMu.bpe.w = $(window).width();
  }
  function checkResizing() {
    windowhw();
    if(!UMu.bpe.timedOut && UMu.bpe.pageloaded) {
      if(UMu.bpe.afterFired == -1 || UMu.bpe.afterFired) {
        window.dispatchEvent(UMu.bpe.before);
        UMu.bpe.afterFired = 0;
      }
      UMu.bpe.timedOut = true;
      UMu.bpe.lws = [UMu.bpe.h, UMu.bpe.w];
      setTimeout(function(){
        UMu.bpe.timedOut = false;
        if(UMu.bpe.h == UMu.bpe.lws[0] && UMu.bpe.w == UMu.bpe.lws[1]) {
          window.dispatchEvent(UMu.bpe.after);
           UMu.bpe.afterFired = 1;
        } else {
          checkResizing();
        }
      }, 800);
    }
    UMu.bpe.pageloaded = true;
  }
  //expects arr of breakpoints to check against
  function checkBP(breakpoints) {
    var matched = false;
    breakpoints.forEach(function(breakpoint) {
      var bp = Breakpoints.get(breakpoint);
      if(bp.isMatched()) {
        matched = true;
      }
    });
    return matched;
  }
  //wrapper for use in public namespace
  UMu.checkBP = function(breakpoints) {
    checkBP(breakpoints);
  }



  return UMu;
})(jQuery) : umUtils;
