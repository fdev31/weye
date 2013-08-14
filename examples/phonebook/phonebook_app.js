// FIXME: this example is pretty shitty
$.ajax({url: '/d'+ui.doc_ref+'/phone_data.js', dataType: 'json'})
.done(function(d) {
    var c=$('#contents');
    c.html( get_view('people', {permalink: ui.permalink, child: d})); // render
    c.find('.items').isotope({itemSelector: '.item',  layoutMode : 'fitRows'}); // add as isotope list
    $('#addsearch_form button[name=search]').addClass('hidden');
    $('#addsearch_form').show();
})
.fail(function(e) {
    $.pnotify({text:"Can't load phone data !", type: "error"});
    setTimeout( $('#backlink').click, 900);
    console.log(e);
});



plugin_data['bkp_add_new_item'] = add_new_item;

add_new_item = function() {
    alert('fouin');
};


plugin_cleanup = function() {
    add_new_item = plugin_data['bkp_add_new_item'];
};
