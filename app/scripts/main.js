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
        // getElementBottom = function getElementBottom(el){
        //   return $(el).position().top + $(el).outerHeight(true);
        // },
        // distanceFromPageBottom = function distanceFromPageBottom(el){
        //   return $document.height() - getHeightandOffset(el);
        // },
        triggerPageTransition = function triggerPageTransition(transition){
          // transition.direction
          // var loadedNewPage = _loadNewContent(transition);
          // debugger;
          // var content = $(transition.page),
          //     number = content.find('h1').text().replace( /^\D+/g, ''),
          //     text = content.find('h1').text().trim().replace(/[0-9]/g, '');
          // content.find('h1').empty();
          // if (transition.direction === 'up') {
          //   number--;
          // }
          // if (transition.direction === 'down') {
          //   number++;
          // }

          // content.find('h1').text(text + ' ' + number);


          // content.show().find('.scene_element')
          setTimeout(function(){
            $('.scene_element').not('#page-current').addClass('scene_element--fadeinup');
          }, 600);
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
              // console.log("Reached beginning of page.");
              var appendedPage = _loadNewContent();
              triggerPageTransition({
                direction: 'up',
                page: appendedPage
              });
            }

            if(thisScrollTop + thisInnerHeight === $body.outerHeight()) {
              console.log('Reached end of page.');
            }

            if($window.scrollTop() + $window.height() > $document.height() - 60) {
              console.log('Near end of page.');
              setTimeout(function(){
                $('.scene_element').not('#page-current').addClass('scene_element--fadeinup');
              }, 300);
            }

            if($window.scrollTop() + $window.height() === $document.height()) {
              var appendedPage = _loadNewContent();
              triggerPageTransition({
                direction: 'down',
                page: appendedPage
              });
            }

          });
        },
        _loadNewContent = function _loadNewContent(){
          var clonePage = $(settings.mainAreaID).find('.container').clone();
          clonePage.find('.scene_element').removeClass('active scene_element--fadeinup scene_element--fadein');
          $(clonePage).appendTo(settings.mainAreaID);

          return clonePage;
          // debugger;
          // if ($(settings.mainAreaID).siblings(settings.pageContainerClass)){
          //   $(settings.mainAreaID).siblings(settings.pageContainerClass).last().after(newPage);
          // } else {
          //   $(settings.mainAreaID).after(newPage);
          // }
          //$(newPage).addClass('scene_element--fadeinup');
          // var newlyLoadedContent,
          //     url = $(settings.nextAreaID).data('url'),
          //     contentId = url.replace('.html', ''),
          //     ajaxLoadContentId = 'section-'+ contentId,
          //     divTemplate = '<hr><section class="full-height" id="'+ ajaxLoadContentId +'"></section>';
          //
          // $(settings.mainAreaID).append(divTemplate);
          // newlyLoadedContent = $('#' + ajaxLoadContentId);
          // newlyLoadedContent.load(url + ' #page-current' );
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
