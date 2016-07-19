package dsta.kickstart.armaintain;

import android.content.Intent;
import android.hardware.SensorManager;
import android.location.LocationListener;
import android.net.Uri;
import android.widget.Toast;

import com.wikitude.architect.ArchitectView;
import com.wikitude.architect.ArchitectView.ArchitectUrlListener;
import com.wikitude.architect.ArchitectView.SensorAccuracyChangeListener;
import com.wikitude.architect.StartupConfiguration;
import com.wikitude.architect.StartupConfiguration.CameraPosition;

import java.io.File;

public class ArActivity extends AbstractArchitectCamActivity {
    private String FOLDERPATH = "videoAR";


    private long lastCalibrationToastShownTimeMillis = System.currentTimeMillis();

    private String worldPath = "ARscripts" + File.separator + FOLDERPATH + File.separator + "index.html";

    protected CameraPosition getCameraPosition(){return StartupConfiguration.CameraPosition.DEFAULT;}
    protected boolean hasGeo() {return false;}
    protected boolean hasIR() {return false;}
    public String getActivityTitle() {return "Maintenance";}

    public String getARchitectWorldPath() {return worldPath;}
    public int getContentViewId() {return R.layout.activity_ar;}
    public int getArchitectViewId() {return R.id.architectView;}
    public String getWikitudeSDKLicenseKey() {return "ISGbzVxeLmm8IgreHDCSoctqLEArVwzw6BuSP53Qpfmk0yj6MYRJ+jd2WFkn2TsMo0zOdqKxGjc9euy78yLEAsUIYG4UYADJSB59azO5+epbyPWQjX9WPIex8/k6XW7ixiHKQBkC92Z1s0MJl5xaXNNzqmWl4EXhlcxvDg4ryVZTYWx0ZWRfX/pvywnIOt/dxVK7AfcU8KlRLhB6EOrPs1nNo3oobZgjiNiOwxIj1MJ+9yUIYK/QqMXFQtne2PhYuQhoM5r7lHuuSONdAuTRA4Y7UrPa2EEj+FaCUAcko22sx++4b1n7rrQmkvCQd7C5KCy1HSlqCuz8vE2+zvGqesLi6lXQRCIA47jL3UnYSxNfiNPukczwEFvATMlF82AZjN2QaHWjZTchj6rZQc1NVxfbXHb9j15VXOvRS5104csWYaVo5+AK1UUklp1kJkkNXMni2odNkXDbl1hfDYrVIA1fe1jczdRTWS0+7K1y2stjkKqXg5Gd7BYB74l5jKROf1Y1JoggRokXX4wlsmcaJDVC2taKD3X+Nqo26AFgxqNrM5xl30C1CTQ9ovhqgkrLUwsPrjbc02ncZ/I7qO72fUYimSW9D2nw35gfee08wzTKHzEMvb/iIef3djh573B2I/dpd3YrcInMKvyEY/KvjgyyAysE+OiKpUiP9pUfgf4=";}
    public float getInitialCullingDistanceMeters() {
        // you need to adjust this in case your POIs are more than 50km away from user here while loading or in JS code (compare 'AR.context.scene.cullingDistance')
        return ArchitectViewHolderInterface.CULLING_DISTANCE_DEFAULT_METERS;
    }
    public ILocationProvider getLocationProvider(final LocationListener locationListener) {return null;}
        //new LocationProvider(this, locationListener);}

    public ArchitectView.ArchitectUrlListener getUrlListener() {
        return new ArchitectUrlListener() {

            @Override
            public boolean urlWasInvoked(String uriString) {
                Uri invokedUri = Uri.parse(uriString);

                // pressed "More" button on POI-detail panel
                if ("markerselected".equalsIgnoreCase(invokedUri.getHost())) {

                   /* final Intent poiDetailIntent = new Intent(ArActivity.this, SamplePoiDetailActivity.class);
                    poiDetailIntent.putExtra("poiID", String.valueOf(invokedUri.getQueryParameter("id")));
                    poiDetailIntent.putExtra("poititle", String.valueOf(invokedUri.getQueryParameter("title")));
                    poiDetailIntent.putExtra("poidesc", String.valueOf(invokedUri.getQueryParameter("description")));
                    ArActivity.this.startActivity(poiDetailIntent);
                    */

                    return true;

                }
                return true;
            }
        };
    }

    public ArchitectView.SensorAccuracyChangeListener getSensorAccuracyListener(){
        return new SensorAccuracyChangeListener() {
            @Override
            public void onCompassAccuracyChanged( int accuracy ) {
                    /* UNRELIABLE = 0, LOW = 1, MEDIUM = 2, HIGH = 3 */
                if ( accuracy < SensorManager.SENSOR_STATUS_ACCURACY_MEDIUM && ArActivity.this != null && !ArActivity.this.isFinishing() && System.currentTimeMillis() - ArActivity.this.lastCalibrationToastShownTimeMillis > 5 * 1000) {
                    Toast.makeText( ArActivity.this, R.string.compass_accuracy_low, Toast.LENGTH_LONG ).show();
                    ArActivity.this.lastCalibrationToastShownTimeMillis = System.currentTimeMillis();
                }
            }
        };
    }
}
