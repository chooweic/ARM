var stepLogic = {

    // For future purpose, if want to include videosDrawables, additional parameter of drawableVideoList and stepVideoData is required
    assignStepsToTrackerTarget: function assignStepsToTrackerTargetFn(drawableList, tracker, targetName){
        for (i=0; i<stepData.length; i++){
		    drawableList.push(new AR.ImageDrawable( new AR.ImageResource(stepData[i].imgUrl)
                            , stepData[i].height, stepData[i].options ));
		}

        var stepTrackable = new AR.Trackable2DObject(tracker, targetName, {
                                        drawables: {
                                            cam: drawableList
                                        },
                                        onEnterFieldOfVision: function onEnterFieldOfVisionFn() {
                                            World.commonReset();
                                            World.showButtonBar_Step();
                                            World.showStep(World.currentStep);
                                        },
                                        onExitFieldOfVision: function onExitFieldOfVisionFn() {
                                            World.resetButtonBar();
                                        }
                                    });
    }
}