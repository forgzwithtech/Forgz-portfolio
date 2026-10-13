import { memo } from 'react';
import { asset } from '../../lib/dom';
import '../../styles/ikstore.css';

/**
 * A responsive storefront rendered at a "logical" width and scaled into each device's
 * screen. Container queries (see ikstore.css) make it reflow like a real site would:
 * one column on phones, two on foldables, a full nav and three columns on laptops.
 *
 * Swap this component for any other demo (or an <iframe>) to showcase something else.
 */
function IkStoreDemoBase() {
  return (
    <>
      <div className="n">
        <b className="logo">
          <i>IK</i>PHONES
        </b>
        <span className="links">
          <span>Catalog</span>
          <span>Trade-In</span>
          <span>Valuate</span>
          <span>Support</span>
          <span>About</span>
        </span>
        <em className="bag">
          Bag<u>0</u>
        </em>
      </div>
      <div className="h">
        <div>
          <p className="eb">● NEW · IPHONE 17 PRO MAX</p>
          <h1>
            Trade.
            <br />
            <i>Upgrade.</i>
            <br />
            Elevate.
          </h1>
          <p className="sub">Titanium, no more. Faster than ever.</p>
          <div className="bt">
            <span className="b1">Shop now</span>
            <span className="b2">Trade in</span>
          </div>
        </div>
        <div className="ph">
          <img src={asset('ik_orange.jpg')} alt="" width={380} height={430} />
        </div>
      </div>
      <section className="f">
        <h2>Featured devices</h2>
        <p>Handpicked flagships, matched to live physical stock.</p>
        <div className="g">
          <div className="c">
            <div className="im">
              <img src={asset('ik_15pm.jpg')} alt="" width={388} height={286} />
              <em>USED</em>
            </div>
            <div className="bd">
              <h3>Apple iPhone 15 Pro Max</h3>
              <small>256GB · Natural Titanium</small>
              <small>FROM ₦1,600,000</small>
              <p>● 2 units available</p>
            </div>
          </div>
          <div className="c">
            <div className="im">
              <img src={asset('ik_13.jpg')} alt="" width={493} height={656} />
              <em className="o">VERIFIED</em>
            </div>
            <div className="bd">
              <h3>Apple iPhone 13</h3>
              <small>128GB · Verified / Tested</small>
              <p>● Matched to live stock</p>
            </div>
          </div>
          <div className="c">
            <div className="im" style={{ background: '#f4f4f7' }}>
              <img src={asset('ik_orange.jpg')} alt="" width={380} height={430} style={{ objectFit: 'contain' }} />
              <em className="o">NEW</em>
            </div>
            <div className="bd">
              <h3>Apple iPhone 17 Pro Max</h3>
              <small>Brand new</small>
              <p>● Matched to live stock</p>
            </div>
          </div>
        </div>
      </section>
      <section className="tr">
        <div>
          <h2>Trade in your old phone.</h2>
          <p>Get a valuation, then upgrade.</p>
        </div>
        <span className="b3">Start a trade-in</span>
      </section>
      <footer>© IK Phones · Akure, Nigeria</footer>
    </>
  );
}

export const IkStoreDemo = memo(IkStoreDemoBase);
