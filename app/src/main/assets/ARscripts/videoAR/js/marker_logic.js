var manualLogic = {
    assignMarkersToTrackerTarget: function assignStepsToTrackerTargetFn(mList, tracker, targetName){
        camList = [];
        for (i = 0; i < markerData.length; i++){
            mList.push(new Marker(markerData[i]));

            camList.push(mList[i].markerDrawable_idle);
            camList.push(mList[i].markerDrawable_selected);
            camList.push(mList[i].titleLabel);
            camList.push(mList[i].descriptionLabel);
        }

        var manual = new AR.Trackable2DObject(tracker, targetName, {
                                drawables: {
                                    cam: camList
                                },
                                //enableExtendedTracking: true,
                                onEnterFieldOfVision: function onEnterFieldOfVisionFn() {
                                      World.commonReset();
                                      World.showButtonBar_Manual();
                                      if (World.currentMarker !== null){
                                          Marker.prototype.setSelected(World.currentMarker);
                                          World.onMarkerSelected(World.currentMarker);
                                      };
                                  },
                                onExitFieldOfVision: function onExitFieldOfVisionFn() {
                                      World.resetButtonBar();
                                  }});


    }
}



var kMarker_AnimationDuration_ChangeDrawable = 500;
var kMarker_AnimationDuration_Resize = 1000;

/*
Single Set of Marker which consists of:
 1) A selected ImageDrawable
    - Contains an onclick functionality to call panel overlay
 2) A unselected ImageDrawable
 3) A title label
 4) A description label

 markerDrawable_idle, markerDrawable_selected, titleLabel, descriptionLabel
 */
function Marker(pdata) {
    this.data = pdata;
    this.urlStr = pdata.url;
    this.titleStr = pdata.title;
    this.descStr_full = pdata.desc_full;


    this.isSelected = false;

    /*
        With AR.PropertyAnimations you are able to animate almost any property of ARchitect objects. This sample will animate the opacity of both background drawables so that one will fade out while the other one fades in. The scaling is animated too. The marker size changes over time so the labels need to be animated too in order to keep them relative to the background drawable. AR.AnimationGroups are used to synchronize all animations in parallel or sequentially.
    */

    this.animationGroup_idle = null;
    this.animationGroup_selected = null;

    // create the AR.GeoLocation from the poi data
    //var markerLocation = new AR.GeoLocation(poiData.latitude, poiData.longitude, poiData.altitude);

    // create an AR.ImageDrawable for the marker in idle state
    this.markerDrawable_idle = new AR.ImageDrawable(new AR.ImageResource(pdata.imgUrl_idle), 0.25, {
        zOrder: 0,
        opacity: 1.0,
        offsetY: pdata.offY,
        offsetX: pdata.offX,
        /*
            To react on user interaction, an onClick property can be set for each AR.Drawable. The property is a function which will be called each time the user taps on the drawable. The function called on each tap is returned from the following helper function defined in marker.js. The function returns a function which checks the selected state with the help of the variable isSelected and executes the appropriate function. The clicked marker is passed as an argument.
        */
        onClick: Marker.prototype.getOnClickTrigger(this)
    });

    // create an AR.ImageDrawable for the marker in selected state
    this.markerDrawable_selected = new AR.ImageDrawable( new AR.ImageResource(pdata.imgUrl), 0.25, {
        zOrder: 0,
        opacity: 0.0,
        offsetY: pdata.offY,
        offsetX: pdata.offX,
        onClick: null
    });

    // create an AR.Label for the marker's title 
    this.titleLabel = new AR.Label(pdata.title.trunc(15), 0.1, {
        zOrder: 1,
        offsetY: 0.055 + pdata.offY,
        offsetX: pdata.offX,
        style: {
            textColor: '#FFFFFF',
            fontStyle: AR.CONST.FONT_STYLE.BOLD,
            fontSize: "x-small"
        }
    });

    // create an AR.Label for the marker's description
    this.descriptionLabel = new AR.Label(pdata.desc_short.trunc(20), 0.08, {
        zOrder: 1,
        offsetY: -0.055 + pdata.offY,
       offsetX: pdata.offX,
        style: {
            textColor: '#FFFFFF',
            fontSize: "xx-small"
        }
    });

    /*this.markerObject = new AR.GeoObject(markerLocation, {
        drawables: {
            cam: [this.markerDrawable_idle, this.markerDrawable_selected, this.titleLabel, this.descriptionLabel],
        }
    });
    */
    return this;
};

Marker.prototype.getOnClickTrigger = function(marker) {

    /*
        The setSelected and setDeselected functions are prototype Marker functions. 
        Both functions perform the same steps but inverted.
    */

    return function() {

        if (!Marker.prototype.isAnyAnimationRunning(marker)) {
            if (marker.isSelected) {

                Marker.prototype.setDeselected(marker);

            } else {
                Marker.prototype.setSelected(marker);
                try {
                    World.onMarkerSelected(marker);
                } catch (err) {
                    alert(err);
                }

            }
        } else {
            AR.logger.debug('a animation is already running');
        }


        return true;
    };
};

/*
    Property Animations allow constant changes to a numeric value/property of an object, dependent on start-value, end-value and the duration of the animation. Animations can be seen as functions defining the progress of the change on the value. The Animation can be parametrized via easing curves.
*/

Marker.prototype.setSelected = function(marker) {
//    console.log(marker);
    marker.isSelected = true;

    if (marker.animationGroup_selected === null) {

        // create AR.PropertyAnimation that animates the opacity to 0.0 in order to hide the idle-state-drawable
        var hideIdleDrawableAnimation = new AR.PropertyAnimation(marker.markerDrawable_idle, "opacity", null, 0.0, kMarker_AnimationDuration_ChangeDrawable);
        // create AR.PropertyAnimation that animates the opacity to 1.0 in order to show the selected-state-drawable
        var showSelectedDrawableAnimation = new AR.PropertyAnimation(marker.markerDrawable_selected, "opacity", null, 1.0, kMarker_AnimationDuration_ChangeDrawable);

        // create AR.PropertyAnimation that animates the scaling of the idle-state-drawable to 1.2
        var idleDrawableResizeAnimation = new AR.PropertyAnimation(marker.markerDrawable_idle, 'scaling', null, 1.2, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));
        // create AR.PropertyAnimation that animates the scaling of the selected-state-drawable to 1.2
        var selectedDrawableResizeAnimation = new AR.PropertyAnimation(marker.markerDrawable_selected, 'scaling', null, 1.2, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));
        // create AR.PropertyAnimation that animates the scaling of the title label to 1.2
        var titleLabelResizeAnimation = new AR.PropertyAnimation(marker.titleLabel, 'scaling', null, 1.2, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));
        // create AR.PropertyAnimation that animates the scaling of the description label to 1.2
        var descriptionLabelResizeAnimation = new AR.PropertyAnimation(marker.descriptionLabel, 'scaling', null, 1.2, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));

        /*
            There are two types of AR.AnimationGroups. Parallel animations are running at the same time, sequentials are played one after another. This example uses a parallel AR.AnimationGroup.
        */
        marker.animationGroup_selected = new AR.AnimationGroup(AR.CONST.ANIMATION_GROUP_TYPE.PARALLEL, [hideIdleDrawableAnimation, showSelectedDrawableAnimation, idleDrawableResizeAnimation, selectedDrawableResizeAnimation, titleLabelResizeAnimation, descriptionLabelResizeAnimation]);
    }

    // removes function that is set on the onClick trigger of the idle-state marker
    marker.markerDrawable_idle.onClick = null;
    // sets the click trigger function for the selected state marker
    marker.markerDrawable_selected.onClick = Marker.prototype.getOnClickTrigger(marker);

    // starts the selected-state animation
    marker.animationGroup_selected.start();
};

Marker.prototype.setDeselected = function(marker) {

    marker.isSelected = false;

    if (marker.animationGroup_idle === null) {

        // create AR.PropertyAnimation that animates the opacity to 1.0 in order to show the idle-state-drawable
        var showIdleDrawableAnimation = new AR.PropertyAnimation(marker.markerDrawable_idle, "opacity", null, 1.0, kMarker_AnimationDuration_ChangeDrawable);
        // create AR.PropertyAnimation that animates the opacity to 0.0 in order to hide the selected-state-drawable
        var hideSelectedDrawableAnimation = new AR.PropertyAnimation(marker.markerDrawable_selected, "opacity", null, 0, kMarker_AnimationDuration_ChangeDrawable);
        // create AR.PropertyAnimation that animates the scaling of the idle-state-drawable to 1.0
        var idleDrawableResizeAnimation = new AR.PropertyAnimation(marker.markerDrawable_idle, 'scaling', null, 1.0, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));
        // create AR.PropertyAnimation that animates the scaling of the selected-state-drawable to 1.0
        var selectedDrawableResizeAnimation = new AR.PropertyAnimation(marker.markerDrawable_selected, 'scaling', null, 1.0, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));
        // create AR.PropertyAnimation that animates the scaling of the title label to 1.0
        var titleLabelResizeAnimation = new AR.PropertyAnimation(marker.titleLabel, 'scaling', null, 1.0, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));
        // create AR.PropertyAnimation that animates the scaling of the description label to 1.0
        var descriptionLabelResizeAnimation = new AR.PropertyAnimation(marker.descriptionLabel, 'scaling', null, 1.0, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));

        /*
            There are two types of AR.AnimationGroups. Parallel animations are running at the same time, sequentials are played one after another. This example uses a parallel AR.AnimationGroup.
        */
        marker.animationGroup_idle = new AR.AnimationGroup(AR.CONST.ANIMATION_GROUP_TYPE.PARALLEL, [showIdleDrawableAnimation, hideSelectedDrawableAnimation, idleDrawableResizeAnimation, selectedDrawableResizeAnimation, titleLabelResizeAnimation, descriptionLabelResizeAnimation]);
    }

    // sets the click trigger function for the idle state marker
    marker.markerDrawable_idle.onClick = Marker.prototype.getOnClickTrigger(marker);
    // removes function that is set on the onClick trigger of the selected-state marker
    marker.markerDrawable_selected.onClick = null;

    // starts the idle-state animation
    marker.animationGroup_idle.start();
};

Marker.prototype.isAnyAnimationRunning = function(marker) {

    if (marker.animationGroup_idle === null || marker.animationGroup_selected === null) {
        return false;
    } else {
        if ((marker.animationGroup_idle.isRunning() === true) || (marker.animationGroup_selected.isRunning() === true)) {
            return true;
        } else {
            return false;
        }
    }
};

// will truncate all strings longer than given max-length "n". e.g. "foobar".trunc(3) -> "foo..."
String.prototype.trunc = function(n) {
    return this.substr(0, n - 1) + (this.length > n ? '...' : '');
};