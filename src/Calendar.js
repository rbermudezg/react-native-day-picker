'use strict';

import React, {
    PropTypes
} from 'react';
import {
    ListView,
    StyleSheet,
} from 'react-native';

import Month from './Month';

console.disableYellowBox = true;

export default class Calendar extends React.Component {
    static defaultProps = {
        startDate: new Date(),
        monthsCount: 24,
        onSelectionChange: () => {
        },

        monthsLocale: ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'],
        weekDaysLocale: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

        width: 280,

        bodyBackColor: 'white',
        bodyTextColor: 'black',
        headerSepColor: 'grey',

        dayCommonBackColor: 'white',
        dayCommonTextColor: 'black',

        dayDisabledBackColor: 'white',
        dayDisabledTextColor: 'grey',

        daySelectedBackColor: '#4169e1',
        daySelectedTextColor: 'white',

        dayInRangeBackColor: '#87cefa',
        dayInRangeTextColor: 'black',

        dayMarkedBackColor: '#87cefa',
        dayMarkedTextColor: 'black',

        isFutureDate: false,

        rangeSelect: true,

        markedDays: []
    };

    static propTypes = {
        selectFrom: PropTypes.instanceOf(Date),
        selectTo: PropTypes.instanceOf(Date),

        monthsCount: PropTypes.number,
        startDate: PropTypes.instanceOf(Date),

        monthsLocale: PropTypes.arrayOf(PropTypes.string),
        weekDaysLocale: PropTypes.arrayOf(PropTypes.string),
        startFromMonday: PropTypes.bool,

        onSelectionChange: PropTypes.func,

        width: PropTypes.number,

        bodyBackColor: PropTypes.string,
        bodyTextColor: PropTypes.string,
        headerSepColor: PropTypes.string,

        dayCommonBackColor: PropTypes.string,
        dayCommonTextColor: PropTypes.string,

        dayDisabledBackColor: PropTypes.string,
        dayDisabledTextColor: PropTypes.string,

        daySelectedBackColor: PropTypes.string,
        daySelectedTextColor: PropTypes.string,

        dayInRangeBackColor: PropTypes.string,
        dayInRangeTextColor: PropTypes.string,

        dayMarkedBackColor: PropTypes.string,
        dayMarkedTextColor: PropTypes.string,

        isFutureDate: PropTypes.bool,

        rangeSelect: PropTypes.bool,

        markedDays: PropTypes.arrayOf(PropTypes.object)
    };

    constructor(props) {
        super(props);

        this.changeSelection = this.changeSelection.bind(this);
        this.generateMonths = this.generateMonths.bind(this);

        let {selectFrom, selectTo, monthsCount, startDate} = this.props;

        this.selectFrom = selectFrom;
        this.selectTo = selectTo;
        this.months = this.generateMonths(monthsCount, startDate);

        var dataSource = new ListView.DataSource({rowHasChanged: this.rowHasChanged});

        this.state = {
            dataSource: dataSource.cloneWithRows(this.months)
        }
    }

    componentWillReceiveProps(nextProps) {
        if(this.props.markedDays !== nextProps.markedDays){
            this.markedDays = this.generateSelectedDays(nextProps.markedDays);
            this.months = this.months.map((month) => {
                return month.map((day) => {
                    return {
                        date: day.date,
                        status: this.getStatus(day.date, this.selectFrom, this.selectTo, this.markedDays),
                        disabled: day.disabled
                    }
                })
            });
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(this.months)
            })
        }
    }

    rowHasChanged(r1, r2) {
        for (var i = 0; i < r1.length; i++) {
            if (r1[i].status !== r2[i].status && !r1[i].disabled) {
                return true;
            }
        }
    }

    generateMonths(count, startDate) {
        var months = [];
        var dateUTC;
        var monthIterator = startDate;

        var startUTC = Date.UTC(startDate.getYear(), startDate.getMonth(), startDate.getDate());
        this.markedDays = this.generateSelectedDays(this.props.markedDays);

        for (var i = 0; i < count; i++) {
            var month = this.getDates(monthIterator, this.props.startFromMonday);

            months.push(month.map((day) => {
                dateUTC = Date.UTC(day.getYear(), day.getMonth(), day.getDate());
                return {
                    date: day,
                    status: this.getStatus(day, this.selectFrom, this.selectTo, this.markedDays),
                    disabled: day.getMonth() !== monthIterator.getMonth()
                    || ((this.props.isFutureDate) ? startUTC > dateUTC : startUTC < dateUTC)

                }
            }));

            if(this.props.isFutureDate){
                monthIterator.setMonth(monthIterator.getMonth() + 1);
            }else{
                monthIterator.setMonth(monthIterator.getMonth() - 1);
            }
            
        }

        return months;
    }

    generateSelectedDays(markedDays) {
        return markedDays.map((date) => {
            return date.toDateString();
        });    
    }
    
    getDates(month, startFromMonday) {
        month = new Date(month);
        month.setDate(1);

        var delta = month.getDay();
        if (startFromMonday) {
            delta--;
            if (delta === -1) delta = 6;
        }

        var startDate = new Date(month);
        startDate.setDate(startDate.getDate() - delta);

        month.setMonth(month.getMonth() + 1);
        month.setDate(0);

        delta = 6 - month.getDay();
        if (startFromMonday) {
            delta++;
            if (delta === 7) delta = 0;
        }

        var lastDate = new Date(month);
        lastDate.setDate(lastDate.getDate() + delta);

        var allDates = [];
        while (startDate <= lastDate) {
            allDates.push(new Date(startDate));
            startDate.setDate(startDate.getDate() + 1);
        }
        return allDates;
    }

    changeSelection(value) {
        var {selectFrom, selectTo, markedDays, months} = this;

        if (!selectFrom) {
            selectFrom = value;
        } else if (!selectTo) {
            if (value > selectFrom) {
                selectTo = value;
            } else {
                selectFrom = value;
            }
        } else if (selectFrom && selectTo) {
            selectFrom = value;
            selectTo = null;
        }

        months = months.map((month) => {
            return month.map((day) => {
                return {
                    date: day.date,
                    status: this.getStatus(day.date, selectFrom, selectTo, markedDays),
                    disabled: day.disabled
                }
            })
        });

        if (this.props.rangeSelect) {
            this.selectFrom = selectFrom;
            this.selectTo = selectTo;
        } else {
            this.selectFrom = this.selectTo = selectFrom;    
        }

        this.months = months;

        this.props.onSelectionChange(value, this.prevValue);
        this.prevValue = value;

        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(months)
        })
    }

    getStatus(date, selectFrom, selectTo, markedDays) {
        let dateString = date.toDateString();

        if(markedDays && markedDays.indexOf(dateString) !== -1){
            return 'marked';
        }
        if (selectFrom) {
            if (selectFrom.toDateString() === dateString) {
                return 'selected';
            }
        }
        if (selectTo) {
            if (selectTo.toDateString() === dateString) {
                return 'selected';
            }
        }
        if (selectFrom && selectTo) {
            if (selectFrom < date && date < selectTo) {
                return 'inRange';
            }
        }
        
        return 'common';
    }

    render() {
        let {style, contentContainerStyle} = this.props;
        let directionStyles = {};

        if(!this.props.isFutureDate){
            directionStyles = {
                transform: [{scaleY: -1}]
            }
        }

        return (
            <ListView
                initialListSize={5}
                scrollRenderAheadDistance={1200}
                style={[styles.listViewContainer, directionStyles, style]}
                contentContainerStyle={contentContainerStyle}
                dataSource={this.state.dataSource}
                renderRow={(month) => {
                    return (
                        <Month
                            {...this.props}
                            days={month}
                            style={[styles.month, directionStyles]}
                            changeSelection={this.changeSelection}
                        />
                    );
                }}
            />
        );
    }
}

const styles = StyleSheet.create({
    listViewContainer: {
        backgroundColor: 'white',
        alignSelf: 'center',
    },
    month: {
    }
});