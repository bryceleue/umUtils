# umUtils
A javascript toolbox for quickly deploying projects with bootscore


### What you need to know first
If you are unfamiliar with [bootScore](https://bootscore.me/), you should check it out first!  It is a slick theme starter kit for WordPress that lets you use [Bootstrap](https://getbootstrap.com/).  umUtils is meant to be used with these other tools, so if you are here first, you should probably take a peek at those things first!  umUtils also makes use of [breakpoints-js](https://github.com/thecreation/breakpoints-js), an awesome plain js library for attaching callbacks to breakpoints.

## What is umUtils?
Basically, it is a collection of shortcuts that I thought would be useful for rolling out projects with the above tools.

**What umUtils can do right now** 
* Normalize the heights of a group of items
* Dynamically store the height of bootScore's header
* Provide events that fire when the window is resizing and when it has stopped
* A wrapper for addEventListener that allows use of anonymous functions and removeEventListener
* Conveniently target scrollSpy elements
* Trigger the click event on multiple elements with one click
* Use a Bootstrap button group with a Bootstrap carousel more easily

A lot of responsive design approaches focus on targeting an array of viewports without considering that the view port change changes size/dimensions if it is resized after it loads.  One of the objectives of umUtils is to help address awkward behavior after resizing. 

## Getting Started
If you haven't gotten started with setting up your [bootScore](https://bootscore.me/) theme with a WordPress installation [start here first!](https://bootscore.me/documentation/installation/)

**It is also recommended that you [use the bootScore child theme](https://bootscore.me/documentation/using-the-child-themes/).**

The first thing you need to do to use umUtils is [download it](archive/refs/heads/main.zip) and include the necessary files in your bootScore child theme.  It is recommended that you you place the files in the `bootscore-child-main/js/vendor` folder.  Don't forget to include breakpoints-js first!

Next you need to include the files in your bootscore child theme's functions.php file like below (enqueue before custom.js):
```php
wp_enqueue_script('breakpoints-js', get_stylesheet_directory_uri() . '/js/vendor/umUtils/dep/breakpoints.min.js', array(), false, true);
wp_enqueue_script('umUtils-js', get_stylesheet_directory_uri() . '/js/vendor/umUtils/umUtils.min.js', array(), false, true);

```

## How to do stuff


**umUtils.addEvtListener**
```javascript
//dynamically create anonymous functions and pass to addEvtListener and optionally remove after event fires
function somefunction(func, params, remove) {
  umUtils.addEvtListener(document, 'visibilitychange', func, params, remove);
}

somefunction(mytargetelem, function() { dosomethinghere... }, [param1, param2], true);
```


**umUtils.navHeight**
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


**umUtils.onVisible**
```javascript
//Call a function once when the page becomes visible.  Only fires if the page is hidden or in prerender.

```

**umUtils.uniHeight**
```javascript
//Normalize the heights of multiple elements by making them all as tall as the tallest element.

```

**umUtils.triggerClick**
```javascript
//Trigger the click event on multiple targets

```

**Using in your theme's custom.js**
```javascript
  $(document).ready(function() {
    umUtils.uniHeight(".wrapperclass", ".card", true, ['lg', 'xl', 'xxl']); 
    umUtils.uniHeight("#wrapperid .carousel-inner", ".carousel-item", true); 
    umUtils.navHeight("#headerid");
    umUtils.scrollspy(scrollspypages({[5: '#bootscore-navbar']}));
    umUtils.triggerClick();
    umUtils.carouselNavActive("carouselnav");
  });
```





### Breakpoints
As mentioned above, umUtils uses [breakpoints-js](https://github.com/thecreation/breakpoints-js).  The default breakpoints in breakpoints-js have been modified to be consistent with [Bootstrap 5's breakpoints](https://getbootstrap.com/docs/5.1/layout/breakpoints/)

### License
umUtils, [GPLv3](LICENSE)
