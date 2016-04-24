angular.module('FlickerApp').factory('FeedSvc', function($http) {
    var feeds = {};
    feeds.feedList = [];

    feeds.loadFeeds = function() {

        $http({
            method: 'GET',
            url: '/feeds'
        }).success(function(data, status) {
            for (var i = 0; i < data.length; i++) {

                feeds.feedList.push(data[i]);
            }
        }).error(function(data, status) {
            //callback(data);
        });


    };
    feeds.searchByTag = function(tags, callback) {

        $http({
            method: 'GET',
            url: '/search/' + tags
        }).success(function(data, status) {
            //  feeds.feedList = data;
            console.log(feeds.feedList[0].title);
            feeds.feedList = data;
            feeds.feedList[0].title = 'test';
            console.log(feeds.feedList[0].title);

            callback(null, feeds.feedList);
        }).error(function(data, status) {
            callback(data);
        });


    };

    return feeds;

});
