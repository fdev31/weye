"use strict";

var doc_ref = '/';

var selected_item = -1;

var scroll_values = {
    '/': 0
};

$(function() {
    // JavaScript placed here will run only once Kickstrap has loaded successfully.
    /*
  
  
    $.pnotify({
       title: 'Hello World',
       text: 'To edit this message, find me at the bottom of this HTML file.'
    });
    */
    // init the application
  
    view_path(document.location.href.split(/\?view=/)[1] || '/');
    $('#uploadZone').filedrop({
        url: '/upload',
        paramname: 'userfile',
        withCredentials: true,
        data: {
            path: function() { return doc_ref; }
        },
        error: function(err, file) {
          switch(err) {
              case 'BrowserNotSupported':
                    $.pnotify({
                        title: 'Error uploading "'+file+'" content',
                        text: "You don't have an HTML5 compatible browser."
                    });
                  break;
              case 'TooManyFiles':
                    $.pnotify({
                        title: 'Error uploading "'+file+'" content',
                        text: "You are uploading too many files."
                    });
                  // user uploaded more than 'maxfiles'
                  break;
              case 'FileTooLarge':
                    $.pnotify({
                        title: 'Error uploading "'+file+'" content',
                        text: "The file is too large."
                    });
                  // program encountered a file whose size is greater than 'maxfilesize'
                  // FileTooLarge also has access to the file which was too large
                  // use file.name to reference the filename of the culprit file
                  break;
              case 'FileTypeNotAllowed':
                    $.pnotify({
                        title: 'Error uploading "'+file+'" content',
                        text: "This file type is not allowed."
                    });
                  // The file type is not in the specified list 'allowedfiletypes'
              default:
                  break;
          }
      },
      queuefiles: 2,
      dragOver: function() {
          // user dragging files over #dropzone
          $('#uploadZone').addClass('dragged');
      },
      dragLeave: function() {
          // user dragging files out of #dropzone
          $('#uploadZone').removeClass('dragged');
      },
      docOver: function() {
          $('#uploadZone').addClass('hot');
      },
      docLeave: function() {
          $('#uploadZone').removeClass('hot');
      },
    });
    setTimeout( function() {
        $('header').slideUp('slow');
    }, 3000);
    // start navigation
    Mousetrap.bind('tab', function(e) {
        if(selected_item === -1) {
            selected_item = 0;
            console.log($('ul.items > li:first'));
            $('ul.items > li.item:first').addClass('highlighted');
            return false;
        }
    });
    // navigation commands
    Mousetrap.bind('down', function(e) {
        var items=$('ul.items > li.item');
        if (selected_item + 1 < items.length) {
            $(items[selected_item]).removeClass('highlighted');
            selected_item += 1;
            $(items[selected_item]).addClass('highlighted');
            return false;
        }
    });
    Mousetrap.bind('up', function(e) {
        var items=$('ul.items > li.item');
        if (selected_item > 0) {
            $(items[selected_item]).removeClass('highlighted');
            selected_item -= 1;
            $(items[selected_item]).addClass('highlighted');
            return false;
        }
    });
    Mousetrap.bind('enter', function(e) {
        var items=$('ul.items > li.item');
        $(items[selected_item]).trigger('tap');
        return false;
    });
    Mousetrap.bind('backspace', function(e) {
        var items=$('ul.items > li.item');
        $('#backlink').click();
        return false;
    });
});

function popup_menu(elt) {
    console.log('INFOS/DOWLOAD/PREFERENCES/DELETE?');
};

  
// TODO:
// handle "template_prefix" global variable using "bacon.isMobile()"
// to add a "mobile_" prefix to view_page's templates & co

function view_path(path) {
//    console.log('view_path', path);
    scroll_values[doc_ref] = window.scrollY;
//    console.log("saving ", window.scrollY);
    $('.row-fluid').fadeOut('fast');
//    console.log('getting '+path);
    setTimeout( function() {
        $.get('/o'+path)
        .success(function(d) {
//            console.log('object: /o/'+path, d);
            if (d.error) {
                $.pnotify({
                    title: 'Error displaying "'+d.link+'" content',
                    text: d.message
                });
            } else {
                selected_item = -1;
                /* update current document reference */
                if (path !== '/') {
                    doc_ref = path;
                } else {
                    doc_ref = '/';
                }
                /* compute back ref & permalink */
                var bref = doc_ref.match(RegExp('(.*)/[^/]+$'));
                var plink = window.location + '?view=' + path;
                /* "reset" scroll factor (XXX) */
                window.scrollBy(0, -window.scrollY);
                setTimeout( function() {
//                    console.log('scroll by', scroll_values[doc_ref] || 0);
                    window.scroll(0, scroll_values[doc_ref] || 0);
                }, 100);
                /* TODO: use a factory with mustache's lambdas on ich */
                var o = $('.row-fluid div:first'); /* get main content DOM element */
                if (!!bref) {
                    bref = bref[1] || '/';
                } else {
                    bref = false;
                }
                if (d.mime === "folder") {
                    $.get('/c'+path)
                        .success(function(c) {
//                            console.log('children: /c/'+path);
                            o.html( 
                                ich.view_folder({
                                    mime: d.mime,
                                    path: d.path,
                                    have_child: c.length>0,
                                    child: c,
                                    backlink: bref,
                                    permalink: plink
                                })
                            );
                            o.find('.item').each( function(i, x) { 
                                $(x).hammer()
                                    .bind({
                                        tap: function(e) { 
                                            var elt = $(e.target);
                                            view_path(doc_ref+'/'+elt.data('link'));
                                        },
                                        hold: function(e) { popup_menu($(e.target)) },
                                        swipe: function(e) { popup_menu($(e.target)) }
                                    })
                            } );
                        });
                } else {
                    o.html( ich.view_file({
                        item: d,
                        path: path,
                        backlink: bref,
                        permalink: plink
                    })
                          );
                    if (d.mime == 'video') {
                        $('<video controls src="/d'+path+'">Alt descr</video>').appendTo(o);
                    } else if (d.mime.match(RegExp('^image'))) {
                        $('<img src="/d'+path+'" />').appendTo(o);
                    } else if (d.mime.match(RegExp('^text')) || d.mime == 'application-json' || d.mime == 'application-x-javascript') {
                        $('<iframe width="100%" height="100%" src="/d'+path+'" />').appendTo(o);
                    }
                }
                $('.row-fluid').fadeIn('slow');
            }
        }
    )
        .error(function() {
            $.pnotify({ title: 'Error loading "'+path+'"', text: "Server not responding."});
        });
    }, 300);
};
