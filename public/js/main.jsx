/** @jsx React.DOM */

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
            }
        };
    },
    handleSocketMessage: function(e) {
        var d = JSON.parse(e.data);

        if(d[0] === "event" && d[1].type === "pose") {
            this.setState({pose: d[1].pose});
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
        }
    },
    componentDidMount: function() {
        this.setState({socket: new WebSocket(this.props.socketUrl)}, function() {
            this.state.socket.onopen = function() {
                console.log("Connection to Myo Connect established");
            };
            this.state.socket.onerror = function(error) {
                console.log('WebSocket Error ' + error);
            };

            this.state.socket.onmessage = this.handleSocketMessage;
        });
    },
    render: function() {
        return (
            <div>
                <p><b>Myo ID</b>: {this.state.myoId}</p>
                <p><b>Pose</b>: {this.state.pose}</p>
                <hr/>
                <p><b>Orientation (x)</b>: {this.state.orientation.x}</p>
                <p><b>Orientation (y)</b>: {this.state.orientation.y}</p>
                <p><b>Orientation (z)</b>: {this.state.orientation.z}</p>
                <p><b>Orientation (w)</b>: {this.state.orientation.w}</p>
                <hr/>
                <p><b>Accelerometer (x)</b>: {this.state.orientation.accelerometer.x}</p>
                <p><b>Accelerometer (y)</b>: {this.state.orientation.accelerometer.y}</p>
                <p><b>Accelerometer (z)</b>: {this.state.orientation.accelerometer.z}</p>
                <hr/>
                <p><b>Gyroscope (x)</b>: {this.state.orientation.gyroscope.x}</p>
                <p><b>Gyroscope (y)</b>: {this.state.orientation.gyroscope.y}</p>
                <p><b>Gyroscope (z)</b>: {this.state.orientation.gyroscope.z}</p>
            </div>
        );
    }
});

React.renderComponent(
    <div className="row">
        <App socketUrl="ws://127.0.0.1:7204/myo/1" />
    </div>,
    document.getElementById('content')
);

