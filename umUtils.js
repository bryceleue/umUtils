//Umethod Utils//
//Author: Bryce Leue//
//License: GPLv3//
//A collection of utilities for working with the bootscore theme for wordpress//
//Dependencies: (include before this file is included)//
//breakpoints.js//
//jQuery//






if(typeof umUtils == "undefined") {
  var umUtils = (function($) {
    'use strict';

    var UMutils = {

      //  addEvtListener(element, evt, func, params, remove);
      anonCounter:1,
      funcs:{},
      //  private buildFunc(element, evt, func, funcname, params, remove);


      //  scrollspy(pages);
      //  private scrollsp(target, offset);


      //  headerHeight(headerid);
      //  private storeHeight(headerid);


      //  onVisible(func, params, remove);


      //  uniHeight(parent, child, animate, breakpoints);
      //  private enableTransition(selectors);
      //  private clearTransition(selectors);
      //  private getHeight(selectors);
      //  private assignHeights(selectors, breakpoints);
      //  private setHeights(selectors);
      //  private clearHeights(selectors);


      //  triggerClick();


      //  carouselNavActive(navid);
      //  private setcnaClass(navElms, index);


      //  bpEvents();
      bpEvars: {
        before: new Event("umBeforeResize"),
        after:  new Event("umAfterResize"),
        w: 0, h:0, lws: [0,0], timedOut: false, pageloaded: false, afterFired: -1,
        breakpoints: ['sm','md','lg','xl','xxl']
      }
      //  private windowhw();
      //  private checkResizing();


      //  checkBP(breakpoints);
      //  private checkbp(breakpoints);

    }

    //anonCounter:1,
    //funcs:{},
    UMutils.addEvtListener = function(element, evt, func, params, remove) {

        var funcname = (func.name == "" ? 'umAnonFunc' : func.name)+this.anonCounter;
        this.anonCounter++;

        this.funcs[funcname] = buildFunc(element, evt, func, funcname, params, remove);

        element.addEventListener(evt, this.funcs[funcname]);
    }

    function buildFunc(element, evt, func, funcname, params, remove) {
      if(typeof remove == 'undefined' || typeof(remove) !== "boolean") remove = false;
        params = (typeof params == 'undefined' || !Array.isArray(params) && typeof params != "string") ?
          null : Array.isArray(params) ? params : [params];

      return remove ? function() {
        func.apply(null, params);
        element.removeEventListener(evt, UMutils.funcs[funcname]);
        delete UMutils.funcs[funcname];
      } : function() {func.apply(null, params)};
    }


    UMutils.scrollspy = function(pages) {
      var scrollSpy;
      var pageidentified=false;
      if(pages.length) {
        pages.forEach(function(page) {
          for(const [id, section] of Object.entries(page)) {
            if($(".page-id-"+id).length) {
              scrollSpy = scrollsp(section, UMNavH + 1);
              pageidentified = true;
              break;
            }
            if(pageidentified) break;
          }
        });
      }
    }

    function scrollsp(target, offset) {
      var scrollSpy = bootstrap.ScrollSpy.getOrCreateInstance(document.body, {
        target: target,
        offset: offset
      });
      return scrollSpy;
    }


    UMutils.headerHeight = function(headerid) {
      if(!$(headerid).length) return;

      storeHeight(headerid);
      window.addEventListener("umAfterResize", function() {
        storeHeight(headerid);
      });
    }

    function storeHeight(headerid) {
      UMNavH=$(headerid).height();
    }


    UMutils.onVisible = function(func, params, remove) {
      if(document.visibilitystate!=='visible') {
        this.addEvtListener(document, 'visibilitychange', func, params, remove);
      }
    }


    UMutils.uniHeight = function(parent, child, animate, breakpoints) {
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

      this.onVisible(assignHeights, [selectors, breakpoints], true);

      if(document.visibilityState === "visible") {
        assignHeights(selectors, breakpoints);
      }

    }

    function enableTransition(selectors) {
      $(selectors).each(function() {
        UMutils.addEvtListener(this, 'transitionend', clearTransition, selectors, true);
        $(this).css("transition", "height .3s");
      });
    }

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

    function assignHeights(selectors, breakpoints) {
      var bp = typeof(breakpoints) == 'boolean' ? true : checkbp(breakpoints);
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


    UMutils.triggerClick = function() {
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


    UMutils.carouselNavActive = function(navid) {
      var navElms =  document.querySelectorAll("#"+navid+" .btn");
      if(!navElms.length) return;
      var carousel = document.getElementById(navElms[0].getAttribute("data-bs-target").slice(1));
      carousel.addEventListener('slide.bs.carousel', function(evt){
        setcnaClass(navElms, evt.to);
      });
    }

    function setcnaClass(navElms, index) {
      $(navElms).each(function(){
        if(parseInt(this.getAttribute("data-bs-slide-to")) === index) {
          $(this).addClass("active");
        } else {
          if($(this).hasClass("active")) $(this).removeClass("active");
        }
      });
    }

    //bpEvars: {
    //  before: new Event("umBeforeResize"),
    //  after:  new Event("umAfterResize"),
    //  w: 0, h:0, lws: [0,0], timedOut: false, pageloaded: false, afterFired: -1,
    //  breakpoints: ['sm','md','lg','xl','xxl']
    //}
    UMutils.bpEvents = function() {
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
      this.bpEvars.breakpoints.forEach(function(element) {
        Breakpoints.on(element, "enter", checkResizing);
        Breakpoints.on(element, "leave", checkResizing);
      });
    }

    function windowhw() {
      UMutils.bpEvars.h = $(window).height();
      UMutils.bpEvars.w = $(window).width();
    }

    function checkResizing() {

      var vars = UMutils.bpEvars;

      windowhw();

      if(!vars.timedOut && vars.pageloaded) {
        if(vars.afterFired == -1 || vars.afterFired) {
          window.dispatchEvent(vars.before);
          vars.afterFired = 0;
        }

        vars.timedOut = true;
        vars.lws = [vars.h, vars.w];

        setTimeout(function(){
          vars.timedOut = false;

          if(vars.h == vars.lws[0] && vars.w == vars.lws[1]) {
            window.dispatchEvent(vars.after);
            vars.afterFired = 1;

          } else {
            checkResizing();

          }
        }, 800);
      }
      vars.pageloaded = true;
    }

    function checkbp(breakpoints) {
      var matched = false;

      breakpoints.forEach(function(breakpoint) {
        var bp = Breakpoints.get(breakpoint);

        if(bp.isMatched()) {
          matched = true;
        }

      });
      return matched;
    }


    UMutils.checkBP = function(breakpoints) {
      checkbp(breakpoints);
    }


    //polyfills (bootScore doesn't support explorer, so we should probably reconsider whether we actually need any of these)
    Array.prototype.forEach||(Array.prototype.forEach=function(r,o){if("function"!=typeof r)throw new TypeError(r+" is not a function");var t=this;o=o||this;for(var n=0,a=t.length;n!==a;++n)r.call(o,t[n],n,t)});
    Object.entries||(Object.entries=function(e){for(var r=Object.keys(e),t=r.length,n=new Array(t);t--;)n[t]=[r[t],e[r[t]]];return n});
    Array.prototype.includes||(Array.prototype.includes=function(r,t){return void 0===t&&(t=0),-1!=this.indexOf(r,t)});


    return UMutils;
  })(jQuery);

  ////Globals////

  //need global for storing the height of the navbar so theme.js can access it, currently set to bootscore default
  //this gets automatically changed based on changes to the header
  if(typeof UMNavH == "undefined") {
    //set default to match theme.js current default before dynamically updating
    var UMNavH = 55;
  }

  //init bpEvents automatically
  jQuery(document).ready(function() {
    umUtils.bpEvents();
  });

//warn in case of duplicate inclusion or name collision
} else {
  console.warn("Cannot overwrite existing umUtils.  Did you include the file twice?");
}
