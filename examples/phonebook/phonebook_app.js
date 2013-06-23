$.ajax({url: '/d'+ui.doc_ref+'/phone_data.js', dataType: 'json'})
    .done(function(d) {
        o.html( ich['view_people']({permalink: permalink, child: d})); // render
        o.find('.items').isotope({itemSelector: '.item',  layoutMode : 'fitRows'}); // add as isotope list
    })
    .fail(function(e) {
        $.pnotify({text:"Can't load phone data !", type: "error"});
        console.log(e);
    });
