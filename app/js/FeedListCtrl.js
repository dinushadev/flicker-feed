angular.module('FlickerApp')
    .controller('FeedListCtrl', ['$scope', 'FeedSvc', '$sce',
        function($scope, FeedSvc, $sce) {

            var self = this;
            self.searchVal = "";

            FeedSvc.loadFeeds();

            self.feedList = FeedSvc.feedList;

            self.toHtmlVal = function(htmlval) {
                return $sce.trustAsHtml(htmlval);
            };

            self.search = function() {
                if (self.searchVal ) {
                    FeedSvc.searchByTag(self.searchVal, function(err, data) {
                        self.feedList = data;
                    });
                } else {
                    //
                }

            };


        }
    ]);
