# 網站更新草稿:Services(定價分級)— 待發布

> 狀態:**PENDING / 草稿,勿發布**。原因:**報價尚未定案**(2026-07-10)。
> 這是 pneumatheorem.org 的「Services」段落草稿(三級明碼標價),
> **目前尚未**加入 `pneumatheorem-site/index.html`(現行站用的是通用的
> 「Engagement」段,刻意不標價)。

## 發布前待辦(報價定案後再做)
1. **報價定案**:三個 tier 的價格與範圍最終確認(目前 Tier1 £2,000 / Tier2 £15–30k / Tier3 £3–5k/月 為草稿值)。
2. **策略決定**:現行站的「Engagement」段刻意寫「no application form, no scoring, no required pre-qualification」、不公開價目。這段要**取代 Engagement** 還是**與之並存**?公開明碼是策略轉向,需你確認。
3. **修 `{,}` bug**:HTML 裡 `&pound;2{,}000`、`US$2{,}500` 等的 `{,}` 是 LaTeX 千分位寫法漏進來,網頁會原樣顯示成「2{,}000」→ 發布前改成正常逗號 `,`。
4. **補 CSS**:`services / service-tier / tier-label / tier-audience / tier-deliverables / tier-price / services-cta` 這些 class 在 `style.css` 裡沒有樣式,需補一組與現有設計一致的 CSS。

## 草稿 HTML(原樣保存,未修正)
```html
<section class="services">
  <h2>Services</h2>
  <p class="services-intro">
    Three engagement structures, differentiated by scope and commitment.
    Each is a stand-alone offering; Tier 1 is not a prerequisite for
    Tier 2 or Tier 3.
  </p>
  <div class="service-tier">
    <div class="tier-label">Tier 1 &mdash; Discovery Workshop</div>
    <h3>A half-day technical review of your current risk framing</h3>
    <p class="tier-audience">
      For safety officers, event directors, and risk managers who want
      an independent physics-grounded second opinion before committing
      to a full assessment.
    </p>
    <ul class="tier-deliverables">
      <li>Half-day remote workshop (three to four hours, live).</li>
      <li>Written Findings &amp; Recommendations memo (approximately five pages) delivered within seven days.</li>
      <li>Q&amp;A follow-up window of two weeks.</li>
    </ul>
    <p class="tier-price">Fixed fee &pound;2{,}000 / US$2{,}500.</p>
  </div>
  <div class="service-tier">
    <div class="tier-label">Tier 2 &mdash; Venue Risk Assessment</div>
    <h3>A full physics-based assessment of a single venue or event</h3>
    <p class="tier-audience">
      For venue operators, event organisers, and their insurers seeking
      documentation compatible with regulatory submissions and internal
      risk-committee review.
    </p>
    <ul class="tier-deliverables">
      <li>Full P-index and DIM ICE assessment following the R02 methodology.</li>
      <li>Sub-region P<sub>&Omega;</sub> heatmaps, Exceedance Probability curve, per-cell DIM ICE colouring.</li>
      <li>Comprehensive written report (approximately forty to sixty pages).</li>
      <li>One remote walkthrough with your team and, if requested, with your insurer or regulator.</li>
    </ul>
    <p class="tier-price">Fixed fee &pound;15{,}000&ndash;&pound;30{,}000 / US$19{,}000&ndash;US$38{,}000 depending on venue complexity. Four to six weeks.</p>
  </div>
  <div class="service-tier">
    <div class="tier-label">Tier 3 &mdash; Retainer Advisory</div>
    <h3>Continuing technical support for portfolio-scale operations</h3>
    <p class="tier-audience">
      For operators of multi-venue portfolios, insurance underwriters
      with recurring dense-crowd exposure, and regulatory bodies
      requiring on-call technical review.
    </p>
    <ul class="tier-deliverables">
      <li>Monthly technical consultation hours (typically eight to twelve).</li>
      <li>Pre-event review for scheduled high-density events.</li>
      <li>Simulation updates as venue configuration or event profile changes.</li>
      <li>Priority response window: two business days.</li>
    </ul>
    <p class="tier-price">Monthly retainer &pound;3{,}000&ndash;&pound;5{,}000 / US$4{,}000&ndash;US$6{,}000. Minimum six-month engagement.</p>
  </div>
  <div class="services-cta">
    <p>
      Initial enquiries: <a href="mailto:kevin@pneumatheorem.org?subject=PneumaTheorem%20Services%20Enquiry">kevin@pneumatheorem.org</a>.
      A short description of your venue or event and the type of engagement
      you are considering is sufficient. A first response is provided within
      two business days.
    </p>
  </div>
</section>
```
