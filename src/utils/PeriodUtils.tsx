
import moment from "moment";

export function getPeriodStartEnd(periodId: string): { startDate: string, endDate: string } {

    if (periodId.startsWith("W")) {
        const year = periodId.slice(1, 5);
        const weekNumber = periodId.slice(5, 7);

        const startDate = moment().year(Number(year)).isoWeek(Number(weekNumber)).startOf('isoWeek').format('YYYY-MM-DD');
        const endDate = moment().year(Number(year)).isoWeek(Number(weekNumber)).endOf('isoWeek').format('YYYY-MM-DD');

        return { startDate, endDate };
    }
    return { startDate: "", endDate: "" }
}

export function getPeriodsBetween(startPeriod: string, endPeriod: string): Array<string> {

    if (startPeriod <= endPeriod) {
        if (startPeriod.startsWith("W") && endPeriod.startsWith("W")) {
            const startDate = moment(startPeriod.substring(1), 'GGGGWW');
            const endDate = moment(endPeriod.substring(1), 'GGGGWW');
            const weeks: string[] = [];

            while (startDate.isSameOrBefore(endDate)) {
                weeks.push("W" + startDate.format('GGGGWW'));
                startDate.add(1, 'week');
            }
            return weeks;
        }
    }
    return []
}

function getWeeksBetweenDates(startDate: string, endDate: string): Array<string> {

    return getPeriodsBetween(
        "W" + moment(startDate, "YYYY-MM-DD").startOf('isoWeek').format("GGGGWW"),
        "W" + moment(endDate, "YYYY-MM-DD").startOf('isoWeek').format("GGGGWW")
    )
}

export function getPeriodsBetweenDates(startDate: string, endDate: string, periodType: string): Array<string> {

    if (periodType == "W")
        return getWeeksBetweenDates(startDate, endDate)

    return []
}