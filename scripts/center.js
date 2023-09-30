hexo.extend.tag.register('center', function(args, content){
    return '<div style="text-align: center;">' + hexo.render.renderSync({text: content, engine: 'markdown'}) + '</div>';
}, {ends: true});

