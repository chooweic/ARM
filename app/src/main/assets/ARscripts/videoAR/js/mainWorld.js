var World = {

	loaded: false,

    // Video
    video1: null,
    videoOpacity: 0.4,
    videoList: [],  // List of INDEPENDENT videos with their own assignemtn to single target (1 video -> 1 target).

    // Step-by-step
    currentStep: 1,
    groupOfSteps: [], // Currently unused. List of independent stepDrawableList arrays.
    stepDrawableList: [], //ImageDrawables associated with a SINGLE target (N image -> 1 target).

    // Instruction manual
    groupOfMarker: [], // Currently unused. List of independent markerlist arrays.
    markerlist: [], // Set of ImageDrawables ,labels/ associated with a SINGLE target (N image -> 1 target).
    currentMarker: null,

	init: function initFn() {
		this.createOverlays();
	},

	createOverlays: function createOverlaysFn() {
		// Initialize ClientTracker
		//this.tracker = new AR.ClientTracker("assets/magazine.wtc", {
		this.tracker = new AR.ClientTracker("assets/tracker.wtc", {
            onLoaded: this.worldLoaded
		});

		// Section to add tracker for Instruct1. Showcase video concept
        videoLogic.assignVideosToTracker(this.tracker);

		// Section to add tracker for Instruct2. Showcase step-by-step concept
        stepLogic.assignStepsToTrackerTarget(World.stepDrawableList,this.tracker,"instruct2");

        // Section to add multiple points of interest markers for manual
        manualLogic.assignMarkersToTrackerTarget(World.markerlist,this.tracker,"overview");

		// Sample. Create a button which opens a website in a browser window after a click
        /*
        this.imgButton = new AR.ImageResource("assets/wwwButton.jpg");
        var pageOneButton = this.createWwwButton("http://n1sco.com/specifications/", 0.1, {
            offsetX: -0.05,
            offsetY: 0.2,
            zOrder: 1
        });
        */
	},

	onMarkerSelected: function onMarkerSelectedFn(marker){
	    World.currentMarker = marker;

        // update panel values
        $("#poi-detail-title").html(marker.titleStr);
        $("#poi-detail-description").html(marker.descStr_full);

        // show panel
        $("#panel-poidetail").panel("open", 123);

        $(".ui-panel-dismiss").unbind("mousedown");

        $("#panel-poidetail").on("panelbeforeclose", function(event, ui) {
            if (World.currentMarker !== null) World.currentMarker.setDeselected(World.currentMarker);
            World.currentMarker = null;
        });
	},

    tempClosePoiPanel: function tempClosePoiPanel(){
        cm = World.currentMarker; // Does not want currentMarker to clear upon close
        $("#panel-poidetail").panel("close", 123);
        World.currentMarker = cm;
    },

	onPoiDetailMoreButtonClicked: function onPoiDetailMoreButtonClickedFn(){
        console.log(World.currentMarker.urlStr);
	},

	createWwwButton: function createWwwButtonFn(url, size, options) {
		options.onClick = function() {
			// this call opens a url in a browser window
			AR.context.openInBrowser(url);
		};
		return new AR.ImageDrawable(this.imgButton, size, options);
	},

    // updates status message shon in small "i"-button aligned bottom center
	updateStatusMessage: function updateStatusMessageFn(message, isWarning) {

		var themeToUse = isWarning ? "e" : "c";
		var iconToUse = isWarning ? "alert" : "info";

		$("#status-message").html(message);
		$("#popupInfoButton").buttonMarkup({
			theme: themeToUse
		});
		$("#popupInfoButton").buttonMarkup({
			icon: iconToUse
		});
	},

	worldLoaded: function worldLoadedFn() {
        World.resetButtonBar();
        if (World.currentMarker !== null){
            World.onMarkerSelected(World.currentMarker);
        };
	},

    //defaultButtonBar: '<h1>Scanning for vehicle parts</h1>',

	showButtonBar_Video: function showButtonBar_VideoFn(){
        $("#videoBar").show();
        $("#stepBar").hide();
        $("#manualBar").hide();
        $("#defBar").hide();
        $("#tb_steps").hide();
	},
	showButtonBar_Step: function showButtonBar_StepFn(){
            $("#videoBar").hide();
            $("#stepBar").show();
            $("#manualBar").hide();
            $("#defBar").hide();
            $("#tb_steps").fadeIn();
    },
    showButtonBar_Manual: function showButtonBar_ManualFn (){
                $("#videoBar").hide();
                $("#stepBar").hide();
                $("#manualBar").show();
                $("#defBar").hide();
    },
    commonReset: function commonResetFn(){
        if (World.currentMarker !== null){
            World.tempClosePoiPanel();
        };
    },
	resetButtonBar: function resetButtonBarFn(){
	    $("#videoBar").hide();
        $("#stepBar").hide();
        $("#manualBar").hide();
        $("#defBar").show();
        $("#tb_steps").hide();
	},

    showOpacityPanel: function showOpacityPanelFn(){
        $('#panel-opacity-slider').change(function() {
        				World.updateOpacityValues();
        			});
        // open panel
        $("#panel-opacity").trigger("updatelayout");
        $("#panel-opacity").panel("open", 1234);
    },

    updateOpacityValues: function updateOpacityValuesFn(){
        World.videoOpacity = $("#panel-opacity-slider").val();

        for (i=0; i< World.videoList.length; i++){
            video.opacity = parseFloat(World.videoOpacity);
        }
    },

    showStep: function showStepFn(newStep){

        World.changeStepButton(World.currentStep,newStep);
        World.changeStepDisplay(newStep);

        World.currentStep = newStep;
        for (i=0; i<World.stepDrawableList.length; i++){
            World.stepDrawableList[i].enabled = false;
        }
        World.stepDrawableList[newStep-1].enabled = true;
    },

    changeStepButton: function changeStepButtonFn(oldStep,newStep){
        $("#stepButton"+String(oldStep)).buttonMarkup({ theme: "c" });
        $("#stepButton"+String(newStep)).buttonMarkup({ theme: "a" });
    },
    changeStepDisplay: function changeStepDisplayFn(newStep){
        $("#div_righttop").html(stepData[newStep-1].html_a);
        $("#div_rightbtm").html(stepData[newStep-1].html_b);
    }
};

World.init();
