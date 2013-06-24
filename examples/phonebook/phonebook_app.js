$.ajax({url: '/d'+ui.doc_ref+'/phone_data.js', dataType: 'json'})
.done(function(d) {
    var c=$('#contents');
    c.html( ich['view_people']({permalink: ui.permalink, child: d})); // render
    c.find('.items').isotope({itemSelector: '.item',  layoutMode : 'fitRows'}); // add as isotope list
    $('#addsearch_form button[name=search]').addClass('hidden');
    $('#addsearch_form').show();
})
.fail(function(e) {
    $.pnotify({text:"Can't load phone data !", type: "error"});
    console.log(e);
    setTimeout( $('#backlink').click, 900);
});



plugin_data['bkp_add_new_item'] = add_new_item;

add_new_item = function() {
    alert('fouin');
};


plugin_cleanup = function() {
    add_new_item = plugin_data['bkp_add_new_item'];
};
