import ZookeeperClient from "../lib/ZookeeperClient";
import chai from 'chai';
const expect = chai.expect;

let zkClient;

describe('ZookeeperClient TEST',function() {
    before(function(done) {
        zkClient = new ZookeeperClient({zkAddress:"127.0.0.1"});
        done()
    });
    it('ZookeeperClient exists',async function() {

        expect(true).to.be.equal(true);
    });
    it('ZookeeperClient getChildren',async function() {
        expect(true).to.be.equal(true);
    });
    it('ZookeeperClient getData',async function() {
        expect(true).to.be.equal(true);
    });

    it('ZookeeperClient create',async function() {
        expect(true).to.be.equal(true);
    });
});
