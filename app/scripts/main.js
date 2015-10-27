/*global $:false, jQuery:false, window:false */
$( function() {
  'use strict';
  var pageManager = ( function() {
    var $window = $( window ),
      $document = $( document ),
      $body = $( 'body' ),
      defaults = {
        stage: '[data-role="stage"]',
        page: '[data-role="page"]',
        pageContainerClass: '.page-container',
        mainAreaID: '#page-current',
        prevAreaID: '#page-prev',
        nextAreaID: '#page-next',

      },
      routes = {
        '': 'index',
        '/': 'index',
        'index' : 'index',
        'work' : 'work',
        'services' : 'services',
        'about' : 'about',
        'thoughts' : 'thoughts',
        'contact' : 'contact'
      },
      settings,
      getHeightandOffset = function getHeightandOffset( el ) {
        return $( el ).outerHeight( true ) + $( el ).offset().top;
      },
      distanceFromPageTop = function distanceFromPageTop( el ) {
        return $( el ).offset().top;
      },
      _initCTAbuttons = function _initCTAbuttons($el) {
        $el.off('click').on('click', function (ev) {
          ev.preventDefault();

          _loadAnimateNextPage({
            position: ev.currentTarget.dataset.position,
            el: speedBumpEl
          });

        });
      },
      _templateSpeedBump = function _templateSpeedBump( params ) {
        return [ '<a href="#" data-role="speedbump" data-position="'+ params.position +'" id="' + params.id + '-' + params.page + '-' + params.position +'" class="speedBump-container speedBump-' + params.position + '">',
          '<div class="speedBump">LOADING...</div>',
        '</a>' ].join( '\n' );
      },
      _getSpeedBump = function _getSpeedBump( position ) {
        var $speedBumpEl = null,
          id = "speedBump",
          page = routes[window.location.hash.replace('#', '')],
          speedBumpHTML = _templateSpeedBump( {
            id: id,
            page: page,
            position: position
          } ),
          speedBump = $.parseHTML( speedBumpHTML );

        if( !$( '#' + $( speedBump ).attr( 'id' ) ).length ) {
          if( position === "append" ) {
            $( settings.stage ).find('[data-page="'+ page +'"]').append( speedBumpHTML );
          } else {
            $( settings.stage ).find('[data-page="'+ page +'"]').prepend( speedBumpHTML );
          }
          $speedBumpEl = $( '#' + $( speedBump ).attr( 'id' ) );
          _initCTAbuttons($speedBumpEl);
          return $speedBumpEl;

        } else {
          $speedBumpEl = $( '#' + $( speedBump ).attr( 'id' ) );
          _initCTAbuttons($speedBumpEl);
          return $speedBumpEl;
        }

      },
      _loadInNextPage = function _loadInNextPage( params ) {
        var status = false,
            error;
        var promise = new RSVP.Promise( function( resolve, reject ) {
          $.get( 'about.html' )
            .done( function( result ) {
              var
                $html = $( result ),
                $parsedPage = $html.find( settings.page )[ 0 ];
                status = !!$parsedPage;

                result = {
                  loaded: status,
                  pageName: $html.find('[data-role="page"]').data('page'),
                  $parsedPage: $parsedPage,
                  position: params.position
                };
              resolve( result );
            })
            .fail( function( error ) {
              var result = {
                loaded: status,
                position: params.position,
                errorMsg: "Error: " + error.responseText
              };
              reject( result );
            });
        });
        return promise;
      },
      _toggleSpeedBump = function _toggleSpeedBump( params, callback ) {
        if( params.visible ) {
          $( params.el ).find( '.speedBump' ).addClass( 'active' );
        } else {
          $( params.el ).find( '.speedBump' ).removeClass( 'active' );
        }
        if ( callback ){
          callback();
        }
      },
      triggerPageTransition = function triggerPageTransition( params ) {
        if( params.position === "append" ) {
          $( params.page ).addClass( 'scene_element--fadeinup' );

          $( 'html, body' ).animate( {
            scrollTop: $( params.page ).offset().top / 8
          }, 500 );
        }
      },
      _scrollWindow = function _scrollWindow ( params ) {
        var topOffset = 0;
        if ( params.type === 'preview' ) {
          topOffset = $( params.el ).offset().top - $( params.el ).outerHeight(true) / 1.25;
        } else if ( params.type === 'half' ) {
          topOffset = $( params.el ).offset().top - $( params.el ).outerHeight(true) / 2;
        } else if ( params.type === 'whole' ) {
          topOffset = $( params.el ).offset().top;
        }

        $( 'html, body' ).animate( { scrollTop: topOffset }, 500 );
      },
      _isHidden = function _isHidden( el ) {
        return $( el ).css( 'opacity' ) === 0;
      },
      _onScroll = function _onScroll() {

        $window.on( 'scroll', function( ev ) {
          var thisScrollTop = Math.round( $( this ).scrollTop() ),
            thisInnerHeight = Math.round( $( this ).innerHeight() ),
            position, speedBumpEl;

          if( thisScrollTop === 0 ) {
            console.log( "Reached beginning of page." );
          }

          if( $window.scrollTop() + $window.height() > $document.height() - 60 ) {
            console.log( 'Near end of page.' );
            position = 'append';
            speedBumpEl = _getSpeedBump( position );
          }

          if( $window.scrollTop() + $window.height() === $document.height() ) {
            console.log( 'Reached end of page.' );
            position = 'append';
            speedBumpEl = _getSpeedBump( position );

            _loadAnimateNextPage({
              position: position,
              el: speedBumpEl
            });
          }

        } );
      },
      _loadAnimateNextPage = function _loadAnimateNextPage ( params ) {
        _toggleSpeedBump( {
          el: params.speedBumpEl,
          position: params.position,
          visible: true
        } , function(){
          setTimeout(function(){
            _loadInNextPage( {
              position: params.position
            } )
              .then(function( result ) {
                window.location.hash = result.pageName;
                if( result.position === "append" ) {
                  $( settings.stage ).append( result.$parsedPage );
                  _scrollWindow({
                    el: result.$parsedPage,
                    position: result.position,
                    type: 'whole'
                  });
                } else {
                  $( settings.stage ).prepend( result.$parsedPage );
                }
                _toggleSpeedBump( {
                  el: params.speedBumpEl,
                  position: result.position,
                  visible: false
                } );
              }, function( error ){
                error.previousText = $( params.speedBumpEl ).find( '.speedBump' ).text();
                _toggleSpeedBump( {
                  el: params.speedBumpEl,
                  position: error.position,
                  visible: true
                } );

                $( params.speedBumpEl ).find( '.speedBump' ).addClass( 'bg-danger text-danger' ).text( error.errorMsg );

                setTimeout(function(){
                  _toggleSpeedBump( {
                    el: params.speedBumpEl,
                    position: error.position,
                    visible: false
                  } , function(){ // callback
                    setTimeout( function() {
                      $( params.speedBumpEl ).find( '.speedBump' ).removeClass( 'bg-danger text-danger' ).text( error.previousText );
                    }, 2000);
                  });
                }, 2000 );

              });
          }, 2000);
        });
      },
      _render = function _render() {
        setTimeout( function() {
          $window.on( 'scroll', _onScroll() );
        }, 500 );
      },
      init = function init( options ) {
        settings = $.extend( {}, defaults, options );
        _render();
        $window.load( function() {
          $window.scrollTop( $( '[data-page] .page-block' ).offset().top );
        } );
      };

    return {
      init: init,
      triggerPageTransition: triggerPageTransition,
      getHeightandOffset: getHeightandOffset,
      distanceFromPageTop: distanceFromPageTop
    };
  } )();

  pageManager.init();

} );
