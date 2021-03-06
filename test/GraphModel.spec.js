import DimensionalData from '../src/models/DimensionalData'
import GraphModel from '../src/models/GraphModel'

import config from '../src/config'
import uniques from './mocks/uniques'

const metric = {
    type: 'lines',
    value: 'devices',
    area: 'reading',
    breakdowns: [{
        on: false,
        name: 'Access site',
        breakdownName: 'access-site',
        values: [
            { name: 'Mobile Site', on: true, key: 'mobile-site' },
            { name: 'Desktop Site', on: true, key: 'desktop-site' }
        ]
    }],
};

let dimensionalData = new DimensionalData(uniques.desktop.items);
dimensionalData.merge(uniques.mobile.items);

describe('GraphModel', function () {
    it('should reflect basic properties', function () {
        let graphModel = new GraphModel(metric);
        graphModel.setData(dimensionalData);

        expect(graphModel.area).toEqual(metric.area);
        expect(graphModel.breakdowns[1].name).toEqual(metric.breakdowns[0].name);
    });

    it('should aggregate total when metric is additive', function () {
        metric.additive = true;

        let graphModel = new GraphModel(metric);
        graphModel.setData(dimensionalData);
        expect(graphModel.getAggregateLabel()).toEqual('Total');
        expect(graphModel.getAggregate()).toEqual(1449174299);

        expect(graphModel.getLimitedAggregate(3)).toEqual(355950563);
        expect(graphModel.getLimitedAggregate(300)).toEqual(1449174299);
    });

    it('should aggregate average when metric is not additive', function () {
        metric.additive = false;

        let graphModel = new GraphModel(metric);
        graphModel.setData(dimensionalData);
        expect(graphModel.getAggregateLabel()).toEqual('Average');
        expect(graphModel.getAggregate()).toEqual(120764524.9);
    });

    it('should total properly when breaking down', function () {
        metric.additive = true;

        let graphModel = new GraphModel(metric);
        graphModel.activeBreakdown = graphModel.breakdowns[1];
        graphModel.setData(dimensionalData);

        graphModel.activeBreakdown.values[0].on = true;
        graphModel.activeBreakdown.values[1].on = false;
        expect(graphModel.getAggregate()).toEqual(882978744);

        graphModel.activeBreakdown.values[0].on = false;
        graphModel.activeBreakdown.values[1].on = true;
        expect(graphModel.getAggregate()).toEqual(566195555);
    });

    it('should average properly when breaking down', function () {
        metric.additive = false;

        let graphModel = new GraphModel(metric);
        graphModel.activeBreakdown = graphModel.breakdowns[1];
        graphModel.setData(dimensionalData);

        graphModel.activeBreakdown.values[0].on = true;
        graphModel.activeBreakdown.values[1].on = false;
        expect(graphModel.getAggregate()).toEqual(73581562);

        graphModel.activeBreakdown.values[0].on = false;
        graphModel.activeBreakdown.values[1].on = true;
        expect(graphModel.getAggregate()).toEqual(47182962.9);
    });
});
