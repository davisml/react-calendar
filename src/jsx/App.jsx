import {Component, PropTypes, default as React} from 'react'
import ReactDOM from 'react-dom'
import Calendar from './Calendar.jsx'
import Moment from 'moment'

class App extends Component {
    constructor(props) {
        super(props)

        this.dateChanged = this._dateChanged.bind(this)

        this.state = {
            date: new Date()
        }
    }

    _dateChanged(date) {
        console.log("Date changed")
        console.log(date)

        this.setState({ date })
    }
    
    render() {
        return (
            <div className="application">
                <Calendar date={ this.state.date } onChange={ this.dateChanged }/>
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('content'))

//export default Calendar