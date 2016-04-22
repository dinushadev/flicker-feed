var path = require('path');
var url = require('url');
var express = require('express');
var cons = require('consolidate');
var request = require('request');
var cookieParser = require('cookie-parser');

var FeedParser = require('feedparser');
var fs = require('fs');

var app = module.exports = express();

var globalConfig = {
    minify: process.env.MINIFY == 'yes' ? true : false,
    environment: process.env.ENVIRONMENT || 'local'
};

var rootPath = path.dirname(__dirname);
var port = Number(process.env.PORT || 9999);

app.set('views', path.join(rootPath, 'server'));
app.engine('html', cons.handlebars);
app.set('view engine', 'html');

if (globalConfig.environment == 'local') {
    app.use(require('connect-livereload')());
}

app.use(cookieParser());

app.use(function(req, res, next) {
    var config = configFromReq(req);
    var parsedUrl = url.parse(req.url);
    var splittedPath = parsedUrl.pathname.split(path.sep);

    if (splittedPath[1]) {
        var fileExtension = getFileExtension(parsedUrl.pathname);
        if (fileExtension == 'js' || fileExtension == 'css') {
            addPathPrefix(splittedPath, getMinPrefix(config));
        }
    }

    parsedUrl.pathname = splittedPath.join(path.sep);
    req.url = url.format(parsedUrl);

    req.config = config;
    next();
});

app.use('/', express.static(path.join(rootPath, 'app')));

app.get('/', function(req, res) {


    renderIndex(req.config, res);
});


app.get('/search/:tags', function(req, res) {
    var potoList = [];

    var tags = req.param("tags");;
    var url = 'https://api.flickr.com/services/feeds/photos_public.gne?tags='+tags;
    console.log('taggssssssssssssssssssss '+url);

    var req = request(url),
        feedparser = new FeedParser();

    req.on('error', function(error) {
        // handle any request errors
    });
    req.on('response', function(res) {
        var stream = this;

        if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

        stream.pipe(feedparser);
    });


    feedparser.on('error', function(error) {
        // always handle errors
        console.log(error);
    });
    feedparser.on('readable', function() {
        // This is where the action is!
        var stream = this,
            meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
            ,
            item;

        while (item = stream.read()) {
        //    console.log(item);
            var feed = {
                'title': item.title,
                'dis': item.description
            };
            potoList.push(feed);
        }
        // res.send(potoList);
    });

    feedparser.on('end', function() {
        res.send(potoList);
    });


});


app.get('/feeds', function(req, res) {
    var potoList = [];

    var url = 'https://api.flickr.com/services/feeds/photos_public.gne';

    var req = request(url),
        feedparser = new FeedParser();

    req.on('error', function(error) {
        // handle any request errors
    });
    req.on('response', function(res) {
        var stream = this;

        if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

        stream.pipe(feedparser);
    });


    feedparser.on('error', function(error) {
        // always handle errors
        console.log(error);
    });
    feedparser.on('readable', function() {
        // This is where the action is!
        var stream = this,
            meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
            ,
            item;

        while (item = stream.read()) {
          // /  console.log(item);
            var feed = {
                'title': item.title,
                'dis': item.description,
                'url': item.image.url
            };
            potoList.push(feed);
        }
        // res.send(potoList);
    });

    feedparser.on('end', function() {
        res.send(potoList);
    });


});

app.use(function(req, res) {
    res.redirect('/');
});

app.listen(port, function() {
    console.log('Server listening on port ' + port);
});

function renderIndex(config, res) {
    res.render(getMinPrefix(config) + '/views/index');
}

function configFromReq(req) {
    var config = {};
    config.minify = req.cookies.minify == 'true' ? true : false;
    return config;
}

function getMinPrefix(conf) {
    return conf.minify || globalConfig.minify ? 'minified' : 'unminified';
}

function addPathPrefix(filePath, prefix) {
    filePath.splice(1, 0, prefix);
}

function getFileExtension(filePath) {
    return filePath.split('.').pop();
}
