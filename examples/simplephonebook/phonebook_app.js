// TODO: provide special python route
$.ajax({url: '/d'+ui.doc_ref+'/phone_data.js', dataType: 'json'})
.done(function(d) {
    var c=$('#contents');
    c.html( ich.view_list({
        permalink: ui.permalink,
        backlink: true,
        mime: 'text-x-vcard', // TBD, like "application-x-adressbook" ? // allow mountpoints for images
        cont: '',
        have_child: true,
        child: d.map( function(e) {
            var phones = [];
            var phones_cls = '';
            for(var k in e.phones) {
                phones_cls += ' phone.'+k;
                phones.push({k: 'phone.'+k, v: e.phones[k]});
            };
            return {
                data: phones,
                editables: 'name '+phones_cls,
                searchable: e.name+' '+e.nickname+' '+e.phones.fixe,
                title: e.name + " " + e.surname + " (aka "+ e.nickname + ")" + ' -- ' + e.phones.fixe,
                name: "js:alert('"+e.email+"');",
                mime: 'text-x-credits'
            }
        } )

    }));
    finalize_item_list(c);
    $('#addsearch_form button[name=search]').addClass('hidden');
    $('#addsearch_form').show();
})
.fail(function(e) {
    $.pnotify({text:"Can't load phone data !", type: "error"});
    setTimeout( $('#backlink').click, 900);
});



