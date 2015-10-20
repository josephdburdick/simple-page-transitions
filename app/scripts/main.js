$(function(){
  'use strict';
  var pageManager = (function(){
    var $window = $(window),
        $document = $('document'),
        $body = $('body'),
        defaults = {
          pageContainerClass: '.page-container',
          mainAreaID: '#page-current',
          prevAreaID:  '#page-prev',
          nextAreaID: '#page-next',
        },
        settings,
        routes = ['index', 'work', 'services', 'about', 'thoughts'],
        getHeightandOffset = function getHeightandOffset(el){
          return $(el).outerHeight(true) + $(el).offset().top;
        },
        distanceFromPageTop = function distanceFromPageTop(el){
          return getHeightandOffset(el);
        },
        getElementBottom = function getElementBottom(el){
          return $(el).position().top + $(el).outerHeight(true);
        },
        distanceFromPageBottom = function distanceFromPageBottom(el){
          return $document.height() - getHeightandOffset(el);
        },
        // getPageTop = function getPageTop(){
        //   return getHeightandOffset($);
        // },
        // getPageBottom = function getPageBottom(){
        //   return $nextArea.outerHeight(true) + $nextArea.offset().top;
        // },
        triggerPageTransition = function triggerPageTransition(url){

        },

        _onScroll = function _onScroll(){

          $window.on('scroll', function(ev){
            console.log(ev, settings);

            var thisScrollTop = Math.round($(this).scrollTop()),
                thisInnerHeight = Math.round($(this).innerHeight()),
                scrollPercent = 1 * $window.scrollTop() / ($document.height() - $window.height());

            if(thisScrollTop === 0) {
              // console.log("Reached beginning of page.");
              debugger;
            }

            if(thisScrollTop + thisInnerHeight + 1 >= $body.outerHeight()) {
              // console.log("Reached end of page.");
              _loadNewContent();
            }

          });
        },
        _loadNewContent = function _loadNewContent(){
          var newlyLoadedContent,
              url = $(settings.nextAreaID).data('url'),
              contentId = url.replace('.html', ''),
              ajaxLoadContentId = 'section-'+ contentId,
              divTemplate = '<hr><section class="full-height" id="'+ ajaxLoadContentId +'"></section>';

          $(settings.mainAreaID).append(divTemplate);
          newlyLoadedContent = $('#' + ajaxLoadContentId);
          newlyLoadedContent.load(url + ' #page-current' );
        },
        _render = function render(){
          var bodyOffsetTop = distanceFromPageTop(settings.prevAreaID);
          $window.scrollTop(bodyOffsetTop);

          setTimeout(function(){
            $window.on('scroll', _onScroll());
          }, 500);

          $(settings.mainAreaID).addClass('active');

        },
        init = function init(options){
          settings = $.extend({}, defaults, options);
          $window.on('load', _render());
        };

    return {
      init: init,
      triggerPageTransition: triggerPageTransition
    };
  })();

  pageManager.init();

});
