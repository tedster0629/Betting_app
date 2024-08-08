import React, { Component } from 'react';

class Timer extends Component {

    constructor(props) {
        super(props)
        this.state = {
            time: 0,
            timeStart: 0,
            timeEnd: 0,
            timeRemaining: 1200000,
            visible: false
        };

        this.startTimer = this.startTimer.bind(this);
        this.stopTimer = this.stopTimer.bind(this);
    }

    format(timeRemaining) {
        let startT = new Date(this.state.time);
        let finishT = new Date(this.state.timeEnd);
        let seconds = ((finishT.getTime() - startT.getTime()) / 1000) % 60;
        let minutes = Math.floor(((finishT.getTime() - startT.getTime()) / 1000) / 60);
        return minutes + ':' + seconds;
    }

    componentDidMount() {
        this.startTimer();
    }

    startTimer = () => {
        if (sessionStorage.getItem('timeEnd') !== '0' 
        && sessionStorage.getItem('timeEnd') !== null)
        {
            this.setState({
                timeStart: sessionStorage.getItem('timeStart'),
                timeEnd: sessionStorage.getItem('timeEnd'),
            })
            this.timer = setInterval(() => this.setState({
                time: new Date(Date.now()).toLocaleString()
            }), 1000);
            this.timer = setInterval(() => {
                const newCount = this.state.timeRemaining - 1;
                this.setState(
                    {timeRemaining: newCount >= 0 ? newCount : 0}
                );
            }, 1000);
        }
        else
        {
            this.setState({
                timeStart: new Date(Date.now()).toLocaleString(),
                timeEnd: new Date(Date.now() + 1800000).toLocaleString(),
            });
            this.timer = setInterval(() => this.setState({
                time: new Date(Date.now()).toLocaleString()
            }), 1000);
            sessionStorage.setItem('timeStart',this.state.timeStart);
            sessionStorage.setItem('timeEnd',this.state.timeEnd);
            this.timer = setInterval(() => {
                const newCount = this.state.timeRemaining - 1;
                this.setState(
                    {timeRemaining: newCount >= 0 ? newCount : 0}
                );
            }, 1000);
        }
    }

    stopTimer = () => {
        //kill contract
        sessionStorage.removeItem('timeStart');
        sessionStorage.removeItem('timeEnd');
        clearInterval(this.timer)
    }

    render() {
        return(
            <div className="timer-wrapper col">
                <div className="row">
                    <div className="col-sm-6 column-in-center">
                        <h2>Time remaining: {this.format(this.state.timeRemaining)}</h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-4">
                        <h1>Clock: {this.state.time}</h1>
                    </div>
                    <div className="col-sm-4">
                        <h1>Round stared at: {this.state.timeStart}</h1>
                    </div>
                    <div className="col-sm-4">
                        <h1>Round will be finished at: {this.state.timeEnd}</h1>
                    </div>
                </div>
                <br></br>
                {
                    this.visible?
                <div className="row">
                    <div className="col-sm-6">
                        <button className="betup" onClick={this.startTimer}>Start</button>
                    </div>
                    <div className="col-sm-6">
                        <button className="betdown" onClick={this.stopTimer}>Stop</button>
                    </div>
                </div>
                :null
                }
            </div>
        )
    }
}

export default Timer;