/*global $:false, jQuery:false, window:false */
$(function(){
  'use strict';
  var pageManager = (function(){
    var $window = $(window),
        $document = $(document),
        $body = $('body'),
        defaults = {
          pageContainerClass: '.page-container',
          mainAreaID: '#page-current',
          prevAreaID:  '#page-prev',
          nextAreaID: '#page-next',
        },
        settings,
        newPage,
        // routes = ['index', 'work', 'services', 'about', 'thoughts'],
        getHeightandOffset = function getHeightandOffset(el){
          return $(el).outerHeight(true) + $(el).offset().top;
        },
        distanceFromPageTop = function distanceFromPageTop(el){
          return getHeightandOffset(el);
        },
        triggerPageTransition = function triggerPageTransition(transition){

          if (transition.direction === "prepend"){
            setTimeout(function(){
              $('.scene_element').not('#page-current').addClass('scene_element--fadeindown');
            }, 1000);
          }
          if (transition.direction === "append"){
            setTimeout(function(){
              $('.scene_element').not('#page-current').addClass('scene_element--fadeinup');
            }, 1000);
          }

        },
        _isHidden = function _isHidden(el){
          return $(el).css('opacity') === 0;
        },
        _onScroll = function _onScroll(){

          $window.on('scroll', function(ev){
            console.log(ev, settings);

            var thisScrollTop = Math.round($(this).scrollTop()),
                thisInnerHeight = Math.round($(this).innerHeight());

            if(thisScrollTop === 0) {
              console.log("Reached beginning of page.");
              _loadNewContent('prepend');
            }

            if($window.scrollTop() + $window.height() > $document.height() - 60) {
              console.log('Near end of page.');
            }

            if($window.scrollTop() + $window.height() === $document.height()) {
              console.log('Reached end of page.');

              _loadNewContent('append');
            }

          });
        },
        _loadNewContent = function _loadNewContent(direction){
          var clonePage;


          if (direction === "append"){
            clonePage = $(settings.mainAreaID).find('.container').last().clone();
            clonePage.addClass('clone').find('.scene_element').removeClass('active scene_element--fadeinup scene_element--fadeindown scene_element--fadein');
            $(clonePage).appendTo(settings.mainAreaID);
            triggerPageTransition({
              direction: 'append'
            });
          } else {
            clonePage = $(settings.mainAreaID).find('.container').first().clone();
            clonePage.addClass('clone').find('.scene_element').removeClass('active scene_element--fadeinup scene_element--fadeindown scene_element--fadein');
            $(clonePage).prependTo(settings.mainAreaID);
            triggerPageTransition({
              direction: 'prepend'
            });
          }

          return clonePage;
        },
        _render = function _render(){
          var bodyOffsetTop = distanceFromPageTop(settings.prevAreaID);
          $window.scrollTop(bodyOffsetTop);

          setTimeout(function(){
            $window.on('scroll', _onScroll());
          }, 500);

          $(settings.mainAreaID).css({
            marginTop: $(settings.prevAreaID).outerHeight(),
            marginBottom: $(settings.nextAreaID).outerHeight()
          }).addClass('active');

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
