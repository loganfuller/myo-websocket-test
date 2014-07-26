/** @jsx React.DOM */

var average = function(arr) {
    var x = 0.0,
        length = arr.length;

    for(var i = 0; i < length; i++) {
        x += parseFloat(arr[i]);
    }

    return x / length;
};

var App = React.createClass({
    getInitialState: function() {
        return {
            socket: null,
            pose: "unknown",
            myoId: null,
            orientation: {
                x: 0.0,
                y: 0.0,
                z: 0.0,
                w: 0.0,
                accelerometer: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                gyroscope: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                }
            },
            offset: {
                x: 0,
                y: 0,
                z: 0,
                w: 0,
                accelerometer: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                gyroscope: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                }
            }
        };
    },
    handleGesture: _.debounce(function(poseName) {
        if(poseName === "fingers_spread") {
            this.zeroOrientation();
        }
    }, 150),
    handleSocketMessage: function(e) {
        var d = JSON.parse(e.data);

        if(d[0] === "event" && d[1].type === "pose") {
            this.setState({pose: d[1].pose});
            this.handleGesture(d[1].pose);
        }

        if(d[0] === "event" && d[1].type === "orientation") {
            this.setState({
                myoId: d[1].myo,
                orientation: {
                    x: d[1].orientation.x,
                    y: d[1].orientation.y,
                    z: d[1].orientation.z,
                    w: d[1].orientation.w,
                    accelerometer: {
                        x: d[1].accelerometer[0],
                        y: d[1].accelerometer[1],
                        z: d[1].accelerometer[2]
                    },
                    gyroscope: {
                        x: d[1].gyroscope[0],
                        y: d[1].gyroscope[1],
                        z: d[1].gyroscope[2]
                    }
                }
            });
            window.myoOrientation = this.state;

            // populate streaming graphs
            this.aX.append(new Date().getTime(), d[1].accelerometer[0].toFixed(3));
            this.aY.append(new Date().getTime(), d[1].accelerometer[1].toFixed(3));
            this.aZ.append(new Date().getTime(), d[1].accelerometer[2].toFixed(3));

            this.gX.append(new Date().getTime(), d[1].gyroscope[0].toFixed(3));
            this.gY.append(new Date().getTime(), d[1].gyroscope[1].toFixed(3));
            this.gZ.append(new Date().getTime(), d[1].gyroscope[2].toFixed(3));
        }
    },
    initializeGraphs: function() {
        this.accGraph = new SmoothieChart({
            grid: { fillStyle:"rgb(0,43,54)" }
        }),
        this.gyroGraph = new SmoothieChart({
            grid: { fillStyle:"rgb(0,43,54)" }
        });

        this.accGraph.streamTo(document.getElementById("accelerometer"));
        this.gyroGraph.streamTo(document.getElementById("gyroscope"));

        this.aX = new TimeSeries();
        this.aY = new TimeSeries();
        this.aZ = new TimeSeries();
        this.accGraph.addTimeSeries(this.aX, { strokeStyle:"rgb(220,50,47)" });
        this.accGraph.addTimeSeries(this.aY, { strokeStyle:"rgb(42,161,152)" });
        this.accGraph.addTimeSeries(this.aZ, { strokeStyle:"rgb(38,139,210)" });

        this.gX = new TimeSeries();
        this.gY = new TimeSeries();
        this.gZ = new TimeSeries();
        this.gyroGraph.addTimeSeries(this.gX, { strokeStyle:"rgb(220,50,47)" });
        this.gyroGraph.addTimeSeries(this.gY, { strokeStyle:"rgb(42,161,152)" });
        this.gyroGraph.addTimeSeries(this.gZ, { strokeStyle:"rgb(38,139,210)" });
    },
    componentDidMount: function() {
        var that = this;
        this.setState({socket: new WebSocket(this.props.socketUrl)}, function() {
            this.state.socket.onopen = function() {
                console.log("Connection to Myo Connect established");
            };
            this.state.socket.onerror = function(error) {
                console.log('WebSocket Error ' + error);
            };

            this.state.socket.onmessage = this.handleSocketMessage;
        });
        that.initializeGraphs();
    },
    zeroOrientation: function() {
        console.log("Setting orientation zero...");

        var that = this;

        var orientationBuffer = {
            x: [],
            y: [],
            z: [],
            w: [],
            accelerometer: {
                x: [],
                y: [],
                z: []
            },
            gyroscope: {
                x: [],
                y: [],
                z: []
            }
        };

        var interval = setInterval(function() {
            orientationBuffer.x.push(that.state.orientation.x);
            orientationBuffer.y.push(that.state.orientation.y);
            orientationBuffer.z.push(that.state.orientation.z);
            orientationBuffer.w.push(that.state.orientation.w);

            orientationBuffer.accelerometer.x.push(that.state.orientation.accelerometer.x);
            orientationBuffer.accelerometer.y.push(that.state.orientation.accelerometer.y);
            orientationBuffer.accelerometer.z.push(that.state.orientation.accelerometer.z);

            orientationBuffer.gyroscope.x.push(that.state.orientation.gyroscope.x);
            orientationBuffer.gyroscope.y.push(that.state.orientation.gyroscope.y);
            orientationBuffer.gyroscope.z.push(that.state.orientation.gyroscope.z);
        }, 25);

        setTimeout(function() {
            clearInterval(interval);
            that.setState({
                "offset": {
                    x: average(orientationBuffer.x),
                    y: average(orientationBuffer.y),
                    z: average(orientationBuffer.z),
                    w: average(orientationBuffer.w),
                    accelerometer: {
                        x: average(orientationBuffer.accelerometer.x),
                        y: average(orientationBuffer.accelerometer.y),
                        z: average(orientationBuffer.accelerometer.z)
                    },
                    gyroscope: {
                        x: average(orientationBuffer.gyroscope.x),
                        y: average(orientationBuffer.gyroscope.y),
                        z: average(orientationBuffer.gyroscope.z)
                    }
                }
            });
        }, 500);
    },
    render: function() {
        return (
            <div>
                <div id="textual">
                    <p><b>Myo ID</b>: {this.state.myoId}</p>
                    <p><b>Pose</b>: {this.state.pose}</p>
                    <hr/>
                    <p><b>Orientation (x)</b>: {this.state.orientation.x.toFixed(3)}</p>
                    <p><b>Orientation (y)</b>: {this.state.orientation.y.toFixed(3)}</p>
                    <p><b>Orientation (z)</b>: {this.state.orientation.z.toFixed(3)}</p>
                    <p><b>Orientation (w)</b>: {this.state.orientation.w.toFixed(3)}</p>
                    <hr/>
                    <p><b>Accelerometer (x)</b>: {this.state.orientation.accelerometer.x.toFixed(3)}</p>
                    <p><b>Accelerometer (y)</b>: {this.state.orientation.accelerometer.y.toFixed(3)}</p>
                    <p><b>Accelerometer (z)</b>: {this.state.orientation.accelerometer.z.toFixed(3)}</p>
                    <hr/>
                    <p><b>Gyroscope (x)</b>: {this.state.orientation.gyroscope.x.toFixed(3)}</p>
                    <p><b>Gyroscope (y)</b>: {this.state.orientation.gyroscope.y.toFixed(3)}</p>
                    <p><b>Gyroscope (z)</b>: {this.state.orientation.gyroscope.z.toFixed(3)}</p>
                </div>
                <div id="accelerometerGraph">
                    <p>Accelerometer (<span style={{color: "rgb(220,50,47)"}}>x</span><span style={{color: "rgb(42,161,152)"}}>y</span><span style={{color: "rgb(38,139,210)"}}>z</span>)</p>
                    <canvas id="accelerometer" width="550" height="175"></canvas>
                </div>
                <div id="gyroscopeGraph">
                    <p>Gyroscope (<span style={{color: "rgb(220,50,47)"}}>x</span><span style={{color: "rgb(42,161,152)"}}>y</span><span style={{color: "rgb(38,139,210)"}}>z</span>)</p>
                    <canvas id="gyroscope" width="550" height="175"></canvas>
                </div>
            </div>
        );
    }
});

React.renderComponent(
    <App socketUrl="ws://127.0.0.1:7204/myo/1" />,
    document.getElementById('sensorData')
);

