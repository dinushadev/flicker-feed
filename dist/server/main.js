var path = require('path');
var url = require('url');
var express = require('express');
var cons = require('consolidate');
var request = require('request');
var cookieParser = require('cookie-parser');
var FeedParser = require('feedparser');


var app = module.exports = express();

var globalConfig = {
    minify: process.env.MINIFY == 'yes' ? true : false,
    environment: process.env.ENVIRONMENT || 'local'
};

var rootPath = path.dirname(__dirname);
var port = Number(process.env.PORT || 8080);

//move to cofigs files
var flickerFeedEndPoint = 'https://api.flickr.com/services/feeds/photos_public.gne';

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
    
    var tags = req.param("tags");
    var url = flickerFeedEndPoint + '?tags=' + tags;
    
     callFlickerFeeds(url, function(data) {
        res.json(data);
    });

});


app.get('/feeds', function(req, res) {
    
    var url = flickerFeedEndPoint;
    callFlickerFeeds(url, function(data) {
        res.json(data);
    });
});

app.use(function(req, res) {
    res.redirect('/');
});

app.listen(port, function() {
    console.log('Server listening on port ' + port + ' environment ' + globalConfig.environment);

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


function callFlickerFeeds(url, callbacak) {
    var feedReq = request(url);
    var potoList = [];
    var feedparser = new FeedParser();

    feedReq.on('error', function(error) {
        // handle any request errors
    });
    feedReq.on('response', function(res) {
        var stream = this;

        if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

        stream.pipe(feedparser);
    });

    feedparser.on('error', function(error) {
        console.error("Unexpected Error thrown " + error);
    });
    feedparser.on('readable', function() {
        // This is where the action is!
        var stream = this,
            item;
           // item = stream.read();
      
       // item = stream.read();
        while ( item = stream.read()) {
            // /  console.log(item);
                  console.log('item:'+item);
            var feed = {
                'title': item.title,
                'dis': item.description
            };
            potoList.push(feed);
        }
        // res.send(potoList);
    });

    feedparser.on('end', function() {
        callbacak(potoList);
    });
}
