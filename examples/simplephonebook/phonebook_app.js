// TODO: provide special python route
$.ajax({url: '/d'+ui.doc_ref+'/phone_data.js', dataType: 'json'})
.done(function(d) {
    var c=$('#contents');
    var data = {
        permalink: ui.permalink,
        backlink: true,
        mime: 'text-x-vcard', // TBD, like "application-x-adressbook" ? // allow mountpoints for images
        cont: ui.doc_ref,
    };
    data.child = d.map( function(e) {
            var phones = [];
            var phones_cls = '';
            for(var k in e.phones) {
                phones_cls += ' phone.'+k;
                phones.push({k: 'phone.'+k, v: e.phones[k]});
            };
            phones.push({k: 'email', v: e.email});
            phones.push({k: 'nickname', v: e.nickname});
            var d = {
                data: phones,
                editables: 'title email nickname'+phones_cls,
                searchable: 'title nickname phones.fixe',
                title: e.name + " " + e.surname + " (aka "+ e.nickname + ")" + ' -- ' + e.phones.fixe,
                link: "js:alert('"+e.email+"');",
                mime: 'text-x-credits'
            }
            return d;
    });

    finalize_item_list( c.html( get_view('list', data) ) );
    $('.folder-item').show();
    $('#download_link').parent().hide();
})
.fail(function(e) {
    $.pnotify({text:"Can't load phone data !", type: "error"});
    setTimeout( $('#backlink').click, 900);
});



