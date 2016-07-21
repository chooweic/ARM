var World = {

	loaded: false,

    // Video
    video1: null,
    video1Opacity: 0.4,

    // Step-by-step
    currentStep: 1,
    stepImages:new Array(3),
    stepImagesDrawable:new Array(3),
    toolHTMLs:["Placeholder for Tools Step 1","Placeholder for Tools Step 2","Placeholder for Tools Step 3"],
    stepHTMLs:["Placeholder for Step 1 instructions","Placeholder for Step 2 instructions","Placeholder for Step 3 instructions"],

    // Instruction manual
    markerlist: new Array(4),
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

		/*
			Create a transparent video drawable:
			This bonus example shows you how to add transparent videos on top of a target. Transparent videos require some extra preparation work.

			Summarizing the required steps, here is what you need to do in order to use transparent videos in a simple list. We are describing each of the steps in more detail.

			1.	Produce a green screen (chroma key) video
			2.	Edit that video using standard video processing software
				and remove the green screen. Export your result into a file format,
				which can handle alpha channel information (e.g. Apple PreRes 4444)
			3.	Convert the video from step 2 using the script in the tools folder
			4.	Add it to a target image

			Producing a transparent video is usually done using a green screen for filming and a technique called chroma key to replace the green background with transparency. Extensive information is available on the internet that should help you get started on this topic.

			There are different video codecs that support alpha channels for motion picture and most of them will work as your raw material. We have extensively tested Apple ProRes 4444 codec for our own development and were satisfied with the results.

			The Wikitude SDK can render H.264 encoded videos, which is a codec that in practice does not support an alpha channel. The solution here is to include in the alpha channel in a separate (visible) part of the video. The video is split vertically consisting of a color and a alpha channel in the final video below each other.

			The upper half of the image transports the color information for the final video while the lower half includes a grayscale representation of the alpha layer. White areas will be fully opaque and black areas will be fully transparent. If you are familiar with Photoshop, think of the lower half as a mask. Resulting videos have an height that is exactly twice as big as the input video.

			To convert your raw video to a valid input video for the SDK we need to re-encode the video and automatically create the alpha mask. The script below uses ffmpeg to do so and wraps the necessary commands. Follow these simple steps:

			MacOS X
			Open the Terminal application
			Input cd <SDK>/tools/video/MacOSX. Replace <SDK> with the path to the SDK folder
			Execute sh convert.sh <input video> <output video>. Replace <input video> with the path to your transparent video and <output video> with the path where you want the output video to be stored.

			Windows
			Open the Command Line
			cd <SDK>\tools\video\Windows. Replace <SDK> with the path to the SDK folder
			Execute convert.bat <input video> <output video>. Replace <input video> with the path to your transparent video and <output video> with the path where you want the output video to be stored.
			This creates the required video with a vertically split color and alpha channel.

			Adding the transparent H.264 video to a target image is easy and accomplished in the same way as any other video is added. Just make sure to set the isTransparent property of the AR.VideoDrawable to true.
		*/

		// Section to add tracker for Instruct1. Showcase video concept
		World.video1 = new AR.VideoDrawable("assets/transparentVideo.mp4", 0.7, {
			offsetX: -0.2,
			offsetY: -0.12,
			isTransparent: true,
			opacity: World.video1Opacity
		});
        World.video1.play(-1);
		World.video1.pause();
        var videoInstruct1 = new AR.Trackable2DObject(this.tracker, "instruct1", {
			drawables: {
				cam: [World.video1]
			},
			onEnterFieldOfVision: function onEnterFieldOfVisionFn() {
				World.video1.resume();
				World.showButtonBar_Video();
				if (World.currentMarker !== null){
                    World.tempClosePoiPanel();
                };
			},
			onExitFieldOfVision: function onExitFieldOfVisionFn() {
				World.video1.pause();
				World.resetButtonBar();
			}
		});


		// Section to add tracker for Instruct2. Showcase step-by-step concept
        this.stepImages[0] = new AR.ImageResource("assets/step1.gif");
        this.stepImages[1] = new AR.ImageResource("assets/step2.gif");
        this.stepImages[2] = new AR.ImageResource("assets/step3.gif");

        this.stepImagesDrawable[0] = new AR.ImageDrawable(this.stepImages[0], 1, {
                zOrder: 1
            }
        );
        this.stepImagesDrawable[1] = new AR.ImageDrawable(this.stepImages[1], 1, {
                zOrder: 2
            }
        );
        this.stepImagesDrawable[2] = new AR.ImageDrawable(this.stepImages[2], 1, {
                zOrder: 3
            }
        );
        var stepInstruct2 = new AR.Trackable2DObject(this.tracker, "instruct2", {
        			drawables: {
        				cam: [this.stepImagesDrawable[0],this.stepImagesDrawable[1],this.stepImagesDrawable[2]]
        			},
        			onEnterFieldOfVision: function onEnterFieldOfVisionFn() {
                        World.showButtonBar_Step();
                        World.showStep(World.currentStep);
                        if (World.currentMarker !== null){
                            World.tempClosePoiPanel();
                        };
                    },
        			onExitFieldOfVision: function onExitFieldOfVisionFn() {
                        World.resetButtonBar();
                    }
        		});




        // Section to add multiple labels
        this.markerlist[0] = new Marker(-0.5,-0.5,"Component A","Description B","www.dsta.gov.sg");
        this.markerlist[1] = new Marker(-0.5,0.5,"Component B","Description B","www.dsta.gov.sg");
        this.markerlist[2] = new Marker(0.5,-0.5,"Component C","Description C","www.dsta.gov.sg");
        this.markerlist[3] = new Marker(0.5,0.5,"Component D","Description D","www.dsta.gov.sg");
        var manual = new AR.Trackable2DObject(this.tracker, "overview", {
                drawables: {
                    cam: [
                          this.markerlist[0].markerDrawable_idle, this.markerlist[0].markerDrawable_selected, this.markerlist[0].titleLabel, this.markerlist[0].descriptionLabel,
                          this.markerlist[1].markerDrawable_idle, this.markerlist[1].markerDrawable_selected, this.markerlist[1].titleLabel, this.markerlist[1].descriptionLabel,
                          this.markerlist[2].markerDrawable_idle, this.markerlist[2].markerDrawable_selected, this.markerlist[2].titleLabel, this.markerlist[2].descriptionLabel,
                          this.markerlist[3].markerDrawable_idle, this.markerlist[3].markerDrawable_selected, this.markerlist[3].titleLabel, this.markerlist[3].descriptionLabel
                           ]
                },
                //enableExtendedTracking: true,
                onEnterFieldOfVision: function onEnterFieldOfVisionFn() {
                      World.showButtonBar_Manual();
                      if (World.currentMarker !== null){
                          World.currentMarker.setSelected();
                          World.onMarkerSelected(World.currentMarker);
                      };
                  },
                onExitFieldOfVision: function onExitFieldOfVisionFn() {
                      World.resetButtonBar();
                  }});


		// Sample. Create a button which opens a website in a browser window after a click
        this.imgButton = new AR.ImageResource("assets/wwwButton.jpg");
        var pageOneButton = this.createWwwButton("http://n1sco.com/specifications/", 0.1, {
            offsetX: -0.05,
            offsetY: 0.2,
            zOrder: 1
        });
	},

	onMarkerSelected: function onMarkerSelectedFn(marker){
	    World.currentMarker = marker;

        // update panel values
        $("#poi-detail-title").html(marker.titleStr);
        $("#poi-detail-description").html(marker.descStr);

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
        World.video1Opacity = $("#panel-opacity-slider").val();
        World.video1.opacity = parseFloat(World.video1Opacity);
    },

    showStep: function showStepFn(newStep){

        World.changeStepButton(World.currentStep,newStep);
        World.changeStepDisplay(newStep);

        World.currentStep = newStep;
        for (i=0; i<3; i++){
            World.stepImagesDrawable[i].enabled = false;
        }
        World.stepImagesDrawable[newStep-1].enabled = true;
    },

    changeStepButton: function changeStepButtonFn(oldStep,newStep){
        $("#stepButton"+String(oldStep)).buttonMarkup({ theme: "c" });
        $("#stepButton"+String(newStep)).buttonMarkup({ theme: "a" });
    },
    changeStepDisplay: function changeStepDisplayFn(newStep){
        $("#div_righttop").html(World.toolHTMLs[newStep-1]);
        $("#div_rightbtm").html(World.stepHTMLs[newStep-1]);
    }
};

World.init();
