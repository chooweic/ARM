// Current logic assumes 1 video per trackable. SDK limit of 4.
// To have >1 video per trackable, need to maintain reference to videoTrackable
var videoLogic = {
    assignVideosToTracker: function assignVideosToTrackerFn(tracker){
        for (i = 0; i< videoData.length; i++){
            World.videoList.push(new AR.VideoDrawable(videoData[i].uri, videoData[i].height, videoData[i].options));
            World.videoList[i].opacity = World.videoOpacity;

            World.videoList[i].play(-1);
            World.videoList[i].pause();

            var videoTrackable = new AR.Trackable2DObject(tracker, videoData[i].targetName, {
                                            drawables: {
                                                cam: [World.videoList[i]]
                                            },
                                            onEnterFieldOfVision: function onEnterFieldOfVisionFn() {
                                                World.commonReset();
                                                World.showButtonBar_Video();
                                                videoLogic.resumeVideos(this.drawables.cam );
                                            },
                                            onExitFieldOfVision: function onExitFieldOfVisionFn() {
                                                //World.videoList[0].pause();
                                                videoLogic.pauseVideos(this.drawables.cam);
                                                World.resetButtonBar();
                                            }
            });
        }
    },

    resumeVideos: function resumeVideosFn(vids){
        for (i=0; i < vids.length; i++){
            vids[0].resume();
        }
    },

    pauseVideos: function pauseVideosFn(vids){
        for (i=0; i < vids.length; i++){
            vids[0].pause();
        }
    }
}
