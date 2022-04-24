# umUtils
A javascript toolbox for quickly deploying projects with bootscore


### What you need to know first
If you are unfamiliar with [bootScore](https://bootscore.me/), you should check it out first!  It is a slick theme starter kit for WordPress that lets you use [Bootstrap](https://getbootstrap.com/).  umUtils is meant to be used with these other tools, so if you are here first, you should probably take a peek at those things first!  umUtils also makes use of [breakpoints-js](https://github.com/thecreation/breakpoints-js), an awesome plain js library for attaching callbacks to breakpoints.

## What is umUtils?
Basically, it is a collection of shortcuts that I thought would be useful for rolling out projects with the above tools.

**What umUtils can help you do right now** 
* Normalize the heights of a group of items
* Dynamically store the height of bootScore's header
* Provide events that fire when the window is resizing and when it has stopped
* A wrapper for addEventListener that conveniently allows use of anonymous functions with removeEventListener
* Conveniently target scrollSpy elements
* Eliminate the need for multiple menus/menu switching for multipagers with one pagers
* Call a function when a page is first made visible
* Trigger the click event on multiple elements with one click
* Use a Bootstrap button group with a Bootstrap carousel more easily

A lot of responsive design approaches focus on targeting an array of viewports without considering that the view port changes size/dimensions if it is resized after it loads.  One of the objectives of umUtils is to help address awkward behavior after resizing. 

## Getting Started
If you haven't gotten started with setting up your [bootScore](https://bootscore.me/) theme with a WordPress installation [start here first!](https://bootscore.me/documentation/installation/)

**It is also recommended that you [use the bootScore child theme](https://bootscore.me/documentation/using-the-child-themes/).**

The first thing you need to do to use umUtils is [download the latest release](releases) and include the necessary files in your bootScore child theme.  It is recommended that you you place the files in the `bootscore-child-main/js/vendor` folder.  Don't forget to include breakpoints-js first!

Next you need to include the files in your bootscore child theme's functions.php file like below (enqueue before custom.js):
```php
wp_enqueue_script('breakpoints-js', get_stylesheet_directory_uri() . '/js/vendor/umUtils/dep/breakpoints.min.js', array(), false, true);
wp_enqueue_script('umUtils-js', get_stylesheet_directory_uri() . '/js/vendor/umUtils/umUtils.min.js', array(), false, true);

```

## How to do stuff


### umUtils.addEvtListener
```javascript
//dynamically create anonymous functions and pass to addEvtListener and optionally remove after event fires
function somefunction(func, params, remove) {
  umUtils.addEvtListener(document, 'visibilitychange', func, params, remove);
}

somefunction(mytargetelem, function() { 
  //dosomethinghere... 
}, [param1, param2], true);
```


### umUtils.navHeight
```javascript
//pass id of header to dynamically track header height.  access height with global UMNavH
umUtils.headerHeight('#headerid'); 
```
Because bootScore is set up to facilitate animated scrolling & scrolling to an ID already, umUtils offers you the global variable `UMNavH`.  Header height is hardcoded in the parent theme.  You can change the hardcoded values in js/theme.js from `55` to `UMNavH` to take advantage of this fully.

Example in theme.js:
```javascript
if (target.length) {
  // Change your offset according to your navbar height
  $('html, body').animate({ scrollTop: target.offset().top - UMNavH }, 1000);
  return !1;
}
```
Change
```javascript 
$('html, body').animate({ scrollTop: target.offset().top - 55 }, 1000);
```
to
```javascript
$('html, body').animate({ scrollTop: target.offset().top - UMNavH }, 1000);
```


### umUtils.onVisible
```javascript
//Call a function once when the page becomes visible.  Only fires if the page is hidden or in prerender.
umUtils.onVisible(function() { 
  //do something...
}, [param1, param2], true);

umUtils.onVisible(function() { 
  //do something...
}, false, true);

umUtils.onVisible({ 
  //do something...
});
```

### umUtils.uniHeight
```javascript
//Normalize the heights of multiple elements by making them all as tall as the tallest element.
umUtils.uniHeight("#wrapperid .carousel-inner", ".carousel-item", true);
umUtils.uniHeight(".wrapperclass", ".card", true, ['lg', 'xl', 'xxl']);
```

### umUtils.triggerClick
```javascript
//Trigger the click event a second element
umUtils.triggerClick(); //only call once
```
```html
<!-- target  elements as you want like this: -->
<button data-umethod-targetClick="someid">Button</button>
```

### umUtils.carouselNavActive
```javascript
//pass id of a Bootstrap button group
umUtils.carouselNavActive(buttongroupid);
```
Target the carousel with your button group the same way Bootstrap recommends you do it with indicators
```html
<button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
<div id="buttongroupid" class="btn-group" role="group" aria-label="Basic example">
  <button type="button" class="btn btn-primary" data-bs-target="#carouselid" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1">Left</button>
  <button type="button" class="btn btn-primary" data-bs-target="#carouselid" data-bs-slide-to="1" aria-label="Slide 2">Middle</button>
</div>
```


### umUtils.scrollspy
```javascript
//activate scrollspy for page by id and target specific element
//place page id's and corresponding section ids you want to activate it for in the pages array
//activated pages will automatically modify full urls to be anchors (https://fullhomeurl.com/#anchor to #anchor) - no need to use multiple menus
umUtils.scrollspy(
  scrollspypages({
    [5: '#bootscore-navbar'],
    [23: '#bootscore-navbar'],
    //pass 0 when you want to enable for the home page that is a blog
    [0: '#bootscore-navbar']      
  })
);
 


```
Scrollspy does not currently support targeting more than one specific element per page.  Believe me, I tried already!  scrollSpy can either watch the entire window or a single specified target.  However, umUtils.scrollspy does offer a convenient approach for different configurations for multiple pages.

### Using in your theme's custom.js
```javascript
  $(document).ready(function() { 
    umUtils.uniHeight("#wrapperid .carousel-inner", ".carousel-item", true); 
    umUtils.navHeight("#headerid");
    umUtils.scrollspy(scrollspypages({[5: '#bootscore-navbar']}));
    umUtils.triggerClick();
    umUtils.carouselNavActive("carouselnav");
  });
```

### umUtils Events
You may currently use the events `umBeforeResize` and `umAfterResize` to suit your needs.
```javascript
window.addEventListener("umAfterResize", function() {
  //do stuff...
});
```
umUtils only begins detecting "resizing" and fires umBeforeResize when a breakpoint is passed to limit overhead.  umAfterResize fires when the viewport has not changed in size for 800ms.  I have read crticisms on approaches that utilize polling in scenarios like these, but I don't think polling is always bad. There is a cost to polling, sure, but the cost of a bunch of different callbacks attached to an onresize event or similar is much worse.  If your objective is to approach resizing elements on a page on an individual basis AS the page is resizing in realtime, using something like [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) is probably the way to go.  If you are fine with callbacks firing before or after resizing, these events will suit your needs just fine.



## Breakpoints
As mentioned above, umUtils uses [breakpoints-js](https://github.com/thecreation/breakpoints-js).  The default breakpoints in breakpoints-js have been modified to be consistent with [Bootstrap 5's breakpoints](https://getbootstrap.com/docs/5.1/layout/breakpoints/)

## License
umUtils, [GPLv3](LICENSE)
