/* exported expressSeed */
var expressSeed = angular.module('expressSeed', ['ngSanitize']);


angular.module('expressSeed').factory('FeedSvc', function($http) {
		var feeds ={};
		feeds.feedList =[];
   
        feeds.loadFeeds = function() {

            $http({
                method: 'GET',
                url: '/feeds'
            }).success(function(data, status) {
            	for(var i =0 ; i <data.length; i++){

               	 feeds.feedList.push(data[i]);
            	}
            }).error(function(data, status) {
                //callback(data);
            });


        },
        feeds.searchByTag = function(tags,callback) {

            $http({
                method: 'GET',
                url: '/search/' + tags
            }).success(function(data, status) {
            	feeds.feedList = data;
                callback(null, data);
            }).error(function(data, status) {
                callback(data);
            });


        }

        return feeds;

});


angular.module('expressSeed')
    .controller('FeedListCtrl', ['$scope', 'FeedSvc', '$sce','$rootScope', function($scope, FeedSvc, $sce,$rootScope) {

        var self = this;

        FeedSvc.loadFeeds();

        self.feedList = FeedSvc.feedList;


        self.toHtmlVal = function(htmlval) {
            return $sce.trustAsHtml(htmlval);
        };
      

    }]);



angular.module('expressSeed')
    .controller('SearchCtrl', ['$scope', 'FeedSvc', '$sce', '$rootScope', function($scope, FeedSvc, $sce,$rootScope) {

        $scope.searchVal = '';


        $scope.search = function() {
        	FeedSvc.searchByTag($scope.searchVal,function(err,data){
            	//$scope.$apply();
            	//console.log(FeedSvc.feedList);
            	console.log(FeedSvc.feedList[0].title);
            	FeedSvc.feedList[0].title="HOOOOOOOOOOOOOO";
            
            	//FeedSvc.feedList.push({title:'rrrrrrrrrrr',dis:'dddddddddd'});
            });
        };
       

    }]);
