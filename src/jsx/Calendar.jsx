import {Component, PropTypes, default as React} from 'react'
import Moment from 'moment'
import _ from 'underscore'
import ClassNames from 'classnames'

const dateFormat = "YYYY-MM-DD"

const Day = (props) => {
    const {weekend, today, inMonth, value} = props
    const className = ClassNames('day', {weekend, today, outOfMonth: !inMonth})
    
    let monthLabel = null

    if (props.monthName) {
        monthLabel = <div className="monthLabel">{ props.monthName }</div>
    }

    const clickHandler = (i) => {
        return (event) => {
            console.log("Clicked " + i)

            if (!props.onClick) {
                return
            }

            props.onClick(event, i)
        }
    }

    const items = props.items || []
    
    return <div className={ className }>
        <div className="badge">
            { monthLabel }
            <div className="label">{ value }</div>
        </div>
        <div className="items">
        {
            items.map(({description}, i) => {
                const itemKey = "item" + i
                return <div className="item" key={ itemKey } onClick={ clickHandler(i) }>{ description }</div>
            })
        }
        </div>
    </div>
}

Day.defaultProps = {
    items: []
}

Day.propTypes = {
    items: PropTypes.array
}

const Week = (props) => (
    <div className="week">{
        props.days.map(function(day, i) {
            let events = day.events.splice(0)
            
            if (events.length > 3) {
                events = _.first(events, 3)
            }
            
            let props = _.clone(day)
            props.items = events
            props.inMonth = day.dayIsInMonth
            props.key = "day" + i
            
            delete props.events
            delete props.dayIsInMonth
            
            return <Day {...props}></Day>
        })
    }</div>
)

Week.propTypes = {
    days: PropTypes.array.isRequired
}

const WeekHeader = (props) => (
    <div className="weekHeader">{
        props.days.map(function(day, i) {
            const weekend = (i == 0 || i == 6)
            const className = ClassNames("dayOfWeek", {weekend})
            return <div className={ className } key={ "week" + i }>{ day }</div>
        })
    }</div>
)

WeekHeader.propTypes = {
    days: PropTypes.array.isRequired
}

const preventDefault = function(event) {
    event.preventDefault()
}

class Calendar extends Component {
    constructor(props) {
        super(props)
    }

    goToDate(date) {
        this.props.onChange(date.toDate())
        // this.context.router.push("/calendar/" + date.format(dateFormat))
    }

    goBackMonth() {
        let newDate = this.getCurrentDate().startOf('month')
        newDate.subtract(1, 'month')
        this.goToDate(newDate)
    }
    
    goForwardMonth() {
        let newDate = this.getCurrentDate().startOf('month')
        newDate.add(1, 'month')
        this.goToDate(newDate)
    }
    
    goToToday() {
        this.goToDate(Moment())
    }
    
    getCurrentDate() {
        return Moment(this.props.date)
    }
    
    render() {
        let date = this.getCurrentDate().startOf('month')
        let todayKey = Moment().format(dateFormat)
        
        let monthStartIndex = date.day()
        let daysInMonth = date.daysInMonth()
        
        let currentDate = date.clone().subtract(monthStartIndex, 'day')
        
        const monthName = date.format("MMMM")
        const year = parseInt(date.format("YYYY"))
        
        let daysInLastMonth = 0;

        if (monthStartIndex > 0) {
            let lastDayOfLastMonth = date.clone().subtract(1, 'day')
            daysInLastMonth = lastDayOfLastMonth.daysInMonth()
        }
        
        let weeks = []
        const numberOfWeeks = this.props.visibleWeeks
        
        let dayOfMonth = 1
        let cellIndex = 0
        
        const daysInWeek = Moment.weekdaysShort()
        
        let monthDate = date.clone()
        
        for (let week = 0; week < numberOfWeeks; week++) {
            let days = []
            
            for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++)
            {
                let dayOfMonth = (cellIndex - monthStartIndex) + 1
                let dayIsInMonth = true
                
                if (dayOfMonth < 1) {
                    dayOfMonth = daysInLastMonth + dayOfMonth
                    dayIsInMonth = false
                } else if (dayOfMonth > daysInMonth) {
                    dayOfMonth = (dayOfMonth - daysInMonth)
                    dayIsInMonth = false
                }
                
                const dayString = currentDate.format('YYYY-MM-DD')
                let events = []
                
                let day = {
                    value: dayOfMonth,
                    weekend: (dayOfWeek == 0 || dayOfWeek == 6),
                    today: (todayKey === dayString),
                    dayIsInMonth,
                    events
                }
                
                if (dayOfMonth == 1) {
                    day.monthName = monthDate.format("MMM")
                    monthDate.add(1, 'month')
                }

                days.push(day)
                
                currentDate.add(1, 'day')
                cellIndex++
            }
            
            weeks.push(<Week days={ days } key={ "week" + week } />)
        }
        
        return <div className="calendarContainer">
            <div className="scrollContainer calendarScroll">
                <div className="calendar">{ weeks }</div>
            </div>
            <div className="calendarHeader">
                <div className="headerText">
                    <span className="month">{ monthName }</span> <span className="year">{ year }</span>
                </div>
                <div className="headerButtons">
                    <div className="button" onClick={ this.goBackMonth.bind(this) } onMouseDown={ preventDefault }><i className="fa fa-angle-left"/></div>
                    <div className="button" onClick={ this.goToToday.bind(this) } onMouseDown={ preventDefault }>Today</div>
                    <div className="button" onClick={ this.goForwardMonth.bind(this) } onMouseDown={ preventDefault }><i className="fa fa-angle-right"/></div>
                </div>
                <div className="weekdayTable">
                    <WeekHeader days={ daysInWeek } key="weekHeader"/>
                </div>
            </div>
        </div>
    }
}

Calendar.defaultProps = {
    visibleWeeks: 6
}

Calendar.propTypes = {
    visibleWeeks: PropTypes.number,
    date: PropTypes.instanceOf(Date),
    onChange: PropTypes.func
}

export default Calendar