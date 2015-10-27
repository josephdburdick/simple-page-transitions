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
      settings,
      getHeightandOffset = function getHeightandOffset( el ) {
        return $( el ).outerHeight( true ) + $( el ).offset().top;
      },
      distanceFromPageTop = function distanceFromPageTop( el ) {
        return $( el ).offset().top;
      },
      _templateSpeedBump = function _templateSpeedBump( options ) {
        return [ '<div class="speedBump-container speedBump-' + options.position + '" id="' + options.id + '-' + options.position +'">',
          '<div class="speedBump">LOADING...</div>',
        '</div>' ].join( '\n' );
      },

      _getSpeedBump = function _getSpeedBump( position ) {
        var $speedBumpEl = null,
          id = "speedBump",
          speedBumpHTML = _templateSpeedBump( {
            id: id,
            position: position
          } ),
          speedBump = $.parseHTML( speedBumpHTML );

        if( !$( '#' + $( speedBump ).attr( 'id' ) ).length ) {
          if( position === "append" ) {
            $( settings.stage ).append( speedBumpHTML );
          } else {
            $( settings.stage ).prepend( speedBumpHTML );
          }
          $speedBumpEl = $( '#' + $( speedBump ).attr( 'id' ) );
          return $speedBumpEl;

        } else {
          $speedBumpEl = $( '#' + $( speedBump ).attr( 'id' ) );
          return $speedBumpEl;
        }
      },
      _loadInNextPage = function _loadInNextPage( params ) {
        var status = false,
            error;
        var promise = new RSVP.Promise( function( resolve, reject ) {
          $.get( 'index.html' )
            .done( function( result ) {
              var
                $html = $( result ),
                $parsedPage = $html.find( settings.page )[ 0 ];
                status = !!$parsedPage;

                result = {
                  loaded: status,
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
      _toggleSpeedBump = function _toggleSpeedBump( params, callback ) { //{ el: params.speedBumpEl, position: 'prepend || append', visible: true || false }
        var speedBumpTimerId;
        console.log(params);
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
        debugger;
        // if( params.position === "prepend" ) {
        //   setTimeout( function() {
        //     $( params.page ).addClass( 'scene_element--fadeindown' );
        //     $( 'html, body' ).animate( {
        //       scrollTop: $( params.page ).offset().top / 8
        //     }, 500 );
        //     setTimeout( function() {
        //       _toggleSpeedBump( {
        //         el: params.speedBumpEl,
        //         position: params.position,
        //         visible: true
        //       } );
        //
        //       setTimeout( function() {
        //         _toggleSpeedBump( {
        //           el: params.speedBumpEl,
        //           position: params.position,
        //           visible: false
        //         } );
        //       }, 1000 );
        //     }, 1000 );
        //   }, 1000 );
        // }
        if( params.position === "append" ) {
          $( params.page ).addClass( 'scene_element--fadeinup' );

          setTimeout( function() {
            $( 'html, body' ).animate( {
              scrollTop: $( params.page ).offset().top / 8
            }, 500 );
          }, 1000 );

        }
      },
      _isHidden = function _isHidden( el ) {
        return $( el ).css( 'opacity' ) === 0;
      },
      _onScroll = function _onScroll() {

        $window.on( 'scroll', function( ev ) {
          var thisScrollTop = Math.round( $( this ).scrollTop() ),
            thisInnerHeight = Math.round( $( this ).innerHeight() ),
            position;

          if( thisScrollTop === 0 ) {
            console.log( "Reached beginning of page." );
            // _loadNewContent('prepend');
          }

          if( $window.scrollTop() + $window.height() > $document.height() - 60 ) {
            console.log( 'Near end of page.' );
          }

          if( $window.scrollTop() + $window.height() === $document.height() ) {
            console.log( 'Reached end of page.' );

            position = 'append';
            var speedBumpEl = _getSpeedBump( position );
            _toggleSpeedBump( {
              el: speedBumpEl,
              position: position,
              visible: true
            } );
            setTimeout(function(){
              _loadInNextPage( {
                position: position
              } )
                .then(function( result ) {
                  if( result.position === "append" ) {
                    $( settings.stage ).append( result.$parsedPage );
                  } else {
                    $( settings.stage ).prepend( result.$parsedPage );
                  }
                  _toggleSpeedBump( {
                    el: speedBumpEl,
                    position: result.position,
                    visible: false
                  } );
                }, function( error ){
                  error.previousText = $( speedBumpEl ).find( '.speedBump' ).text();
                  _toggleSpeedBump( {
                    el: speedBumpEl,
                    position: error.position,
                    visible: true
                  } );
                  $( speedBumpEl ).find( '.speedBump' ).addClass( 'bg-danger text-danger' ).text( error.errorMsg );
                  setTimeout(function(){
                    _toggleSpeedBump( {
                      el: speedBumpEl,
                      position: error.position,
                      visible: false
                    } , function(){
                      setTimeout( function() {
                        $( speedBumpEl ).find( '.speedBump' ).removeClass( 'bg-danger text-danger' ).text( error.previousText );
                      }, 1000);
                    });

                  }, 2000 );

                });
            }, 2000);

          }

        } );
      },
      _loadNewContent = function _loadNewContent( position ) {
        var clonePage;
        if( position === "append" ) {
          clonePage = $( settings.mainAreaID ).find( '.container' ).last().clone();
          clonePage.addClass( 'clone' ).find( '.scene_element' ).removeClass(
            'active scene_element--fadeinup scene_element--fadeindown scene_element--fadein'
          );
          $( clonePage ).appendTo( settings.mainAreaID );
          triggerPageTransition( {
            position: 'append'
          } );
        } else {
          clonePage = $( settings.mainAreaID ).find( '.container' ).first().clone();
          clonePage.addClass( 'clone' ).find( '.scene_element' ).removeClass(
            'active scene_element--fadeinup scene_element--fadeindown scene_element--fadein'
          );
          $( clonePage ).prependTo( settings.mainAreaID );
          triggerPageTransition( {
            position: 'prepend'
          } );
        }

        return clonePage;
      },
      _render = function _render() {
        // var bodyOffsetTop = distanceFromPageTop(settings.prevAreaID);
        // $window.scrollTop(bodyOffsetTop);
        setTimeout( function() {
          $window.on( 'scroll', _onScroll() );
        }, 500 );
      },
      init = function init( options ) {
        settings = $.extend( {}, defaults, options );
        _render();
        $window.load( function() {
          $window.scrollTop( $( '[data-page] .page-block' ).offset()
            .top );
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
