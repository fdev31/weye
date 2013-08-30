$.ajax({ url: this.get_child_ref(), context: this })
.success(function(c) {
    this.children = uncompress_resources(c.children);
    Nano.set_content(this);
});

