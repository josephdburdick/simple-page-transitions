/*global $:false, jQuery:false, window:false */
$(function(){
  'use strict';
  var pageManager = (function(){
    var $window = $(window),
        $document = $(document),
        $body = $('body'),
        defaults = {
          stage: '[data-role="stage"]',
          pageContainerClass: '.page-container',
          mainAreaID: '#page-current',
          prevAreaID:  '#page-prev',
          nextAreaID: '#page-next',
        },
        settings,
        newPage,
        _templateSpeedBump = function _templateSpeedBump(options){
          return ['<div class="page-container--loader-container scene_element '+ options.direction +'" id="'+ options.id +'">',
                    '<div class="page-container--loader scene_element">LOADING...</div>',
                  '</div>'].join('\n');
        },
        _loadSpeedBump = function _loadSpeedBump(direction){
          var $speedBumpEl = null,
              id = settings.nextAreaID.replace('#', ''),
              speedBumpHTML = _templateSpeedBump({ id: id, direction: direction }),
              speedBump = $.parseHTML(speedBumpHTML);

          if (!$('#' + $(speedBump).attr('id')).length){
            if (direction === "append") {
              $(settings.stage).append(speedBumpHTML);
            } else {
              $(settings.stage).prepend(speedBumpHTML);
            }
            $speedBumpEl = $('#' + $(speedBump).attr('id'));

            $speedBumpEl.addClass('scene_element--fadeinup');
            // setTimeout(function(){
            //   $speedBumpEl.find('.page-container--loader').addClass('scene_element--fadeinup');
            // }, 1000);
          } else {
            return false;
          }
        },
        // routes = ['index', 'work', 'services', 'about', 'thoughts'],
        getHeightandOffset = function getHeightandOffset(el){
          return $(el).outerHeight(true) + $(el).offset().top;
        },
        distanceFromPageTop = function distanceFromPageTop(el){
          return $(el).offset().top;
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
            var thisScrollTop = Math.round($(this).scrollTop()),
                thisInnerHeight = Math.round($(this).innerHeight());

            if(thisScrollTop === 0) {
              console.log("Reached beginning of page.");
              // _loadNewContent('prepend');
            }

            if($window.scrollTop() + $window.height() > $document.height() - 60) {
              console.log('Near end of page.');
            }

            if($window.scrollTop() + $window.height() === $document.height()) {
              console.log('Reached end of page.');
              setTimeout(function(){
                _loadSpeedBump('append');
              },1000);

              // _loadNewContent('append');
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
          // var bodyOffsetTop = distanceFromPageTop(settings.prevAreaID);
          // $window.scrollTop(bodyOffsetTop);
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
          _render();
          $window.load(function(){
            $window.scrollTop($('[data-page] .page-block').offset().top);
          });
        };

    return {
      init: init,
      triggerPageTransition: triggerPageTransition,
      getHeightandOffset: getHeightandOffset,
      distanceFromPageTop: distanceFromPageTop
    };
  })();

  pageManager.init();

});
