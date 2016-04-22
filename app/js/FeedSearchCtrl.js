/*angular.module('expressSeed')
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
*/