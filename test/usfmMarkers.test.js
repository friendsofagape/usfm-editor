import { act } from "react-dom/test-utils"
import { slateToUsfm } from "../src/transforms/slateToUsfm";
import { usfmToSlate } from "../src/transforms/usfmToSlate";

const id = "\\id id"
const chapterNoNewline = "\\c 1"
const chapter = id + "\n" + chapterNoNewline + "\n"

/**
 * Transforms the input usfm to a slate tree, and then back to usfm.
 * Then tests whether the output matches the original input.
 */
function testUsfm(usfm) {
    let output = null
    act(() => {
        output = slateToUsfm(usfmToSlate(usfm))
    })
    expect(output).toEqual(usfm)
}

/**
 * This form of usfm preservation unit tests runs one test for each number in
 * the input 'numbers' array. The number will replace any '#' character found in 
 * the input usfm. Note that a '0' in the numbers array will simply remove all '#'
 * characters in the usfm- effectively testing an unnumbered marker.
 * 
 * Example:
 *      usfm = `\\imt# imt#_content`
 *      numbers = [0,1,2]
 * 
 * This will test the following usfm strings:
 *      \imt imt_content  (specified by the '0' in the 'numbers' array)
 *      \imt1 imt1_content
 *      \imt2 imt2_content
 */
function testUsfmWithNumbers(usfm, numbers = [0]) {
    if (usfm.match(/(\\.*?)(#)/)) {
        numbers.forEach(value => {
            const replaceNumber = value == 0
                ? ""
                : parseInt(value)
            const thisUsfm = usfm
                .replace(/(\\.*?)(#)/g, `$1${replaceNumber}`)

            testUsfm(thisUsfm)
        })
    } else {
        console.debug(
            "testUsfmWithNumbers() called on usfm with no numbered marker:",
            usfm
        )
        testUsfm(usfm)
    }
}

it("preserves id", () => {
    const usfm = `\\id id_content`
    testUsfm(usfm)
})
it("preserves usfm", () => {
    const usfm = `\\usfm 3.0`
    testUsfm(usfm)
})
it("preserves ide", () => {
    const usfm = `\\ide ide_content`
    testUsfm(usfm)
})
it("preserves h", () => {
    const usfm = `\\h# h_content`
    testUsfmWithNumbers(usfm, [0,1,2,3])
})
it("preserves toc", () => {
    const usfm = `\\toc# toc_content`
    testUsfmWithNumbers(usfm, [1,2,3])
})
it("preserves toca", () => {
    const usfm = `\\toca# toca_content`
    testUsfmWithNumbers(usfm, [1,2,3])
})
it("preserves rem", () => {
    const usfm = `\\rem rem_content`
    testUsfm(usfm)
})
it("preserves sts", () => {
    const usfm = `\\sts 2`
    testUsfm(usfm)
})
it("preserves restore", () => {
    const usfm = `\\restore restore_content`
    testUsfm(usfm)
})
it("preserves imt", () => {
    const usfm = `\\imt# imt_content`
    testUsfmWithNumbers(usfm, [0,1,2,3,4])
})
it("preserves imte", () => {
    const usfm = `\\imte# imte_content`
    testUsfmWithNumbers(usfm, [0,1,2])
})
it("preserves is", () => {
    const usfm = `\\is# is_content`
    testUsfmWithNumbers(usfm, [0,1,2])
})
it("preserves iot", () => {
    const usfm = `\\iot iot _content`
    testUsfm(usfm)
})
it("preserves io", () => {
    const usfm = `\\io# io_content`
    testUsfmWithNumbers(usfm, [0,1,2,3,4])
})
it("preserves ior", () => {
    const usfm = `\\io1 Test \\ior ior_content\\ior* Test`
    testUsfm(usfm)
})
it("preserves ip", () => {
    const usfm = `\\ip ip_content`
    testUsfm(usfm)
})
it("preserves im", () => {
    const usfm = `\\im im_content`
    testUsfm(usfm)
})
it("preserves ipi", () => {
    const usfm = `\\ipi ipi_content`
    testUsfm(usfm)
})
it("preserves imi", () => {
    const usfm = `\\imi imi_content`
    testUsfm(usfm)
})
it("preserves ili", () => {
    const usfm = `\\ili# ili_content`
    testUsfmWithNumbers(usfm, [0,1,2])
})
it("preserves ipq", () => {
    const usfm = `\\ipq ipq_content`
    testUsfm(usfm)
})
it("preserves imq", () => {
    const usfm = `\\imq imq_content`
    testUsfm(usfm)
})
it("preserves ipr", () => {
    const usfm = `\\ipr ipr_content`
    testUsfm(usfm)
})
it("preserves ib", () => {
    const usfm = `\\ib`
    testUsfm(usfm)
})
it("preserves iq", () => {
    const usfm = `\\iq# iq_content`
    testUsfmWithNumbers(usfm, [0,1,2,3])
})
it("preserves iex", () => {
    const usfm = `\\iex iex_content`
    testUsfm(usfm)
})
it("preserves iqt", () => {
    const usfm = `\\imt1 Test \\iqt iqt_content\\iqt* Test`
    testUsfm(usfm)
})
it("preserves ie", () => {
    const usfm = `\\ie`
    testUsfm(usfm)
})
it("preserves c", () => {
    const usfm = id + "\n" + chapterNoNewline
    testUsfm(usfm)
})
it("preserves ca", () => {
    const usfm = chapter + 
        "\\ca 12\\ca*"
    testUsfm(usfm)
})
it("preserves cp", () => {
    const usfm = chapter + 
        `\\cp cp_content`
    testUsfm(usfm)
})
it("preserves cl", () => {
    const usfm = chapter +
        `\\cl cl_content`
    testUsfm(usfm)
})
it("preserves cd", () => {
    const usfm = chapter +
        `\\cd cd_content`
    testUsfm(usfm)
})
it("preserves v", () => {
    const usfm = chapter +
        `\\v 1 v_content`
    testUsfm(usfm)
})
it("preserves va", () => {
    const usfm = chapter +
        `\\v 1 \\va 2\\va* Verse 1 with 2 alt`
    testUsfm(usfm)
})
it("preserves vp", () => {
    const usfm = chapter +
        `\\v 1 \\vp 1b\\vp* Verse 1 with published verse character`
    testUsfm(usfm)
})
it("preserves p", () => {
    const usfm = chapter +
        `\\p p_content`
    testUsfm(usfm)
})
it("preserves m", () => {
    const usfm = chapter +
        `\\m m_content`
    testUsfm(usfm)
})
it("preserves po", () => {
    const usfm = chapter +
        `\\po po_content`
    testUsfm(usfm)
})
it("preserves pr", () => {
    const usfm = chapter +
        `\\pr pr_content`
    testUsfm(usfm)
})
it("preserves cls", () => {
    const usfm = chapter +
        `\\cls cls_content`
    testUsfm(usfm)
})
it("preserves pmo", () => {
    const usfm = chapter +
        `\\pmo pmo_content`
    testUsfm(usfm)
})
it("preserves pm", () => {
    const usfm = chapter +
        `\\pm pm_content`
    testUsfm(usfm)
})
it("preserves pmc", () => {
    const usfm = chapter +
        `\\pmc pmc_content`
    testUsfm(usfm)
})
it("preserves pmr", () => {
    const usfm = chapter +
        `\\pmr pmr_content`
    testUsfm(usfm)
})
it("preserves pi", () => {
    const usfm = chapter +
        `\\pi# pi_content`
    testUsfmWithNumbers(usfm, [0,1,2,3])
})
it("preserves pc", () => {
    const usfm = chapter +
        `\\pc pc_content`
    testUsfm(usfm)
})
it("preserves ph", () => {
    const usfm = chapter +
        `\\ph# ph#_content`
    testUsfmWithNumbers(usfm, [0,1,2,3])
})
it("preserves mi", () => {
    const usfm = chapter +
        `\\mi mi_content`
    testUsfm(usfm)
})
it("preserves nb", () => {
    const usfm = chapter +
        `\\nb`
    testUsfm(usfm)
})
it("preserves q", () => {
    const usfm = chapter +
        `\\q# q_content`
    testUsfmWithNumbers(usfm, [0,1,2,3,4])
})
it("preserves qc", () => {
    const usfm = chapter +
        `\\qc qc_content`
    testUsfm(usfm)
})
it("preserves qr", () => {
    const usfm = chapter +
        `\\qr qr_content`
    testUsfm(usfm)
})
it("preserves qs", () => {
    const usfm = chapter +
        `\\q Test \\qs qs_content\\qs* Test`
    testUsfm(usfm)
})
it("preserves qa", () => {
    const usfm = chapter +
        `\\qa qa_content`
    testUsfm(usfm)
})
it("preserves qac", () => {
    const usfm = chapter +
        `\\v 1 Test \\qac qac_content\\qac* Test`
    testUsfm(usfm)
})
it("preserves qm", () => {
    const usfm = chapter +
        `\\qm# qm_content`
    testUsfmWithNumbers(usfm, [0,1,2,3])
})
it("preserves qd", () => {
    const usfm = chapter +
        `\\qd qd_content`
    testUsfm(usfm)
})
it("preserves b", () => {
    const usfm = chapter +
        `\\b`
    testUsfm(usfm)
})
it("preserves mt", () => {
    const usfm = chapter +
        `\\mt# mt_content`
    testUsfmWithNumbers(usfm, [0,1,2,3,4])
})
it("preserves mte", () => {
    const usfm = chapter +
        `\\mte# mte_content`
    testUsfmWithNumbers(usfm, [0,1,2])
})
it("preserves ms", () => {
    const usfm = chapter +
        `\\ms# ms_content`
    testUsfmWithNumbers(usfm, [0,1,2,3])
})
it("preserves mr", () => {
    const usfm = chapter +
        `\\mr mr_content`
    testUsfm(usfm)
})
it("preserves s", () => {
    const usfm = chapter +
        `\\s# s#_content`
    testUsfmWithNumbers(usfm, [0,1,2,3,4])
})
// s5 is given special treatment since we render it as a horizontal rule.
it("preserves s5", () => {
    const usfm = chapter +
        `\\s5`
    testUsfm(usfm)
})
it("preserves sr", () => {
    const usfm = chapter +
        `\\sr sr_content`
    testUsfm(usfm)
})
it("preserves r", () => {
    const usfm = chapter +
        `\\r r_content`
    testUsfm(usfm)
})
it("preserves rq", () => {
    const usfm = chapter +
        `\\rq rq_content\\rq*`
    testUsfm(usfm)
})
it("preserves sp", () => {
    const usfm = chapter +
        `\\sp sp_content`
    testUsfm(usfm)
})
it("preserves d", () => {
    const usfm = chapter +
        `\\d d_content`
    testUsfm(usfm)
})
it("preserves sd", () => {
    const usfm = chapter +
        `\\sd#`
    testUsfmWithNumbers(usfm, [0,1,2,3,4])
})
it("preserves tr", () => {
    const usfm = chapter +
        `\\tr tr_content`
    testUsfm(usfm)
})
it("preserves lh", () => {
    const usfm = chapter +
        `\\lh lh_content`
    testUsfm(usfm)
})
/**
 * usfm-js only parses unnumbered li if it has an end tag li*,
 * but the usfm documentation does not show an end marker.
 */
xit("preserves unnumbered li", () => {
    const usfm = chapter +
        `\\li li_content\\li*`
    testUsfm(usfm)
})
it("preserves numbered li", () => {
    const usfm = chapter +
        `\\li# li_content`
    testUsfmWithNumbers(usfm, [1,2,3,4])
})
it("preserves lf", () => {
    const usfm = chapter +
        `\\lf lf_content`
    testUsfm(usfm)
})
it("preserves lim", () => {
    const usfm = chapter +
        `\\lim# lim_content`
    testUsfmWithNumbers(usfm, [0,1,2,3,4])
})
it("preserves litl", () => {
    const usfm = chapter +
        `\\lim1\n` +
        `\\v 1 Test \\litl litl_content\\litl*`
    testUsfm(usfm)
})
it("preserves lik & liv", () => {
    const usfm = chapter +
        `\\li1 \\lik lik_content\\lik* \\liv# liv_content\\liv#*`
    testUsfmWithNumbers(usfm, [0,1,2,3,4,5])
})
it("preserves tr and th", () => {
    const usfm = chapter +
        `\\tr \\th1 Day \\th2 Tribe \\th3 Leader \\th4 more \\th5 columns`
    testUsfm(usfm)
})
it("preserves tr and thr", () => {
    const usfm = chapter +
        `\\tr \\thr1 Day \\thr2 Tribe \\thr3 Leader \\thr4 more \\thr5 columns`
    testUsfm(usfm)
})
it("preserves tr and tc", () => {
    const usfm = chapter +
        `\\tr \\tc1 Day \\tc2 Tribe \\tc3 Leader \\tc4 more \\tc5 columns`
    testUsfm(usfm)
})
it("preserves tr and tcr", () => {
    const usfm = chapter +
        `\\tr \\tcr1 Day \\tcr2 Tribe \\tcr3 Leader \\tcr4 more \\tcr5 columns`
    testUsfm(usfm)
})
it("preserves tr and mixed th and thr", () => {
    const usfm = chapter +
        `\\tr \\th1 Day \\th2 Tribe \\thr3 Leader`
    testUsfm(usfm)
})
/**
 * Column spanning is not currently supported by usfm-js.
 */
xit("preserves th column spanning", () => {
    const usfm = chapter +
        `\\tr \\th1-2 Day \\th3 Tribe \\th4-5 Leader`
    testUsfm(usfm)
})
xit("preserves thr column spanning", () => {
    const usfm = chapter +
        `\\tr \\thr1-2 Day \\thr3 Tribe \\thr4-5 Leader`
    testUsfm(usfm)
})
xit("preserves tc column spanning", () => {
    const usfm = chapter +
        `\\tr \\tc1-2 Day \\tc3 Tribe \\tc4-5 Leader`
    testUsfm(usfm)
})
xit("preserves tcr column spanning", () => {
    const usfm = chapter +
        `\\tr \\tcr1-2 Day \\tcr3 Tribe \\tcr4-5 Leader`
    testUsfm(usfm)
})
it("preserves f and unclosed contents", () => {
    const usfm = chapter +
        `\\v 1 \\f + \\fr fr_content \\fq fq_content \\ft ft_content \\fk fk_content \\fqa fqa_content ` +
        `fl_content \\fw fw_content \\fp fp_content \\fv fv_content \\fdc fdc_content \\fm fm_content \\f*`
    testUsfm(usfm)
})
it("preserves f and closed contents", () => {
    const usfm = chapter +
        `\\v 1 \\f + \\fr fr_content\\fr* \\fq fq_content\\fq* \\ft ft_content\\ft* \\fk fk_content\\fk* \\fqa fqa_content\\fqa* ` +
        `\\fl fl_content\\fl* \\fw fw_content\\fw* \\fp fp_content\\fp* \\fv fv_content\\fv* \\fdc fdc_content\\fdc* \\fm fm_content\\fm* \\f*`
    testUsfm(usfm)
})
it("preserves fe and contents", () => {
    const usfm = chapter +
        `\\v 1 \\fe + \\fr fr_content \\fq fq_content \\ft ft_content \\fk fk_content \\fqa fqa_content \\fe*`
    testUsfm(usfm)
})
it("preserves x and unclosed contents", () => {
    const usfm = chapter +
        `\\v 1 \\x + \\xo xo_content \\xop xop_content \\xt xt_content \\xta xta_content \\xk xk_content ` +
        `\\xq xq_content \\xot xot_content \\xnt xnt_content \\xdc xdc_content \\x*`
    testUsfm(usfm)
})
it("preserves x and closed contents", () => {
    const usfm = chapter +
        `\\v 1 \\x + \\xo xo_content\\xo* \\xop xop_content\\xop* \\xt 1|GEN 2:1\\xt* \\xta xta_content\\xta* \\xk xk_content\\xk* ` +
        `\\xq xq_content\\xq* \\xot xot_content\\xot* \\xnt xnt_content\\xnt* \\xdc xdc_content\\xdc* \\rq rq_content\\rq* \\x*`
    testUsfm(usfm)
})
it("preserves qt", () => {
    const usfm = chapter +
        `\\p Test \\qt qt_content\\qt* Test`
    testUsfm(usfm)
})
it("preserves nd", () => {
    const usfm = chapter +
        `\\p Test \\nd nd_content\\nd* Test`
    testUsfm(usfm)
})
it("preserves nested nd", () => {
    const usfm1 = chapter +
        `\\p Test \\bk book of the \\+nd Lord\\+nd*\\bk* Test`
    testUsfm(usfm1)
    const usfm2 = chapter +
        `\\p Test \\bk book of the \\+nd Lord\\+nd*'s battles\\bk* Test`
    testUsfm(usfm2)
})
it("preserves tl", () => {
    const usfm = chapter +
        `\\p Test \\tl tl_content\\tl* Test`
    testUsfm(usfm)
})
it("preserves dc", () => {
    const usfm = chapter +
        `\\p Test \\dc dc_content\\dc* Test`
    testUsfm(usfm)
})
it("preserves bk", () => {
    const usfm = chapter +
        `\\p Test \\bk bk_content\\bk* Test`
    testUsfm(usfm)
})
it("preserves sig", () => {
    const usfm = chapter +
        `\\p Test \\sig sig_content\\sig* Test`
    testUsfm(usfm)
})
it("preserves pn", () => {
    const usfm = chapter +
        `\\p Test \\pn pn_content\\pn* Test`
    testUsfm(usfm)
})
it("preserves png", () => {
    const usfm = chapter +
        `\\p Test \\png png_content\\png* Test`
    testUsfm(usfm)
})
it("preserves wj", () => {
    const usfm = chapter +
        `\\p Test \\wj wj_content\\wj* Test`
    testUsfm(usfm)
})
it("preserves k", () => {
    const usfm = chapter +
        `\\p Test \\k k_content\\k* Test`
    testUsfm(usfm)
})
it("preserves sls", () => {
    const usfm = chapter +
        `\\p Test \\sls sls_content\\sls* Test`
    testUsfm(usfm)
})
it("preserves ord", () => {
    const usfm = chapter +
        `\\p Test \\ord ord_content\\ord* Test`
    testUsfm(usfm)
})
it("preserves add", () => {
    const usfm = chapter +
        `\\p Test \\add add_content\\add* Test`
    testUsfm(usfm)
})
/**
 * usfm-js does not handle addpn properly, like it does for other
 * character markers.
 */
xit("preserves addpn", () => {
    const usfm = chapter +
        `\\p Test \\addpn addpn_content\\addpn* Test`
    testUsfm(usfm)
})
it("preserves lit", () => {
    const usfm = chapter +
        `\\lit lit_content`
    testUsfm(usfm)
})
it("preserves no", () => {
    const usfm = chapter +
        `\\s Test \\no no_content\\no* Test`
    testUsfm(usfm)
})
it("preserves it", () => {
    const usfm = chapter +
        `\\p Test \\it it_content\\it* Test`
    testUsfm(usfm)
})
it("preserves bd", () => {
    const usfm = chapter +
        `\\p Test \\bd bd_content\\bd* Test`
    testUsfm(usfm)
})
it("preserves bdit", () => {
    const usfm = chapter +
        `\\p Test \\bdit bdit_content\\bdit* Test`
    testUsfm(usfm)
})
it("preserves em", () => {
    const usfm = chapter +
        `\\p Test \\em em_content\\em* Test`
    testUsfm(usfm)
})
it("preserves sc", () => {
    const usfm = chapter +
        `\\p Test \\sc sc_content\\sc* Test`
    testUsfm(usfm)
})
it("preserves sup", () => {
    const usfm = chapter +
        `\\p Test \\sup sup_content\\sup* Test`
    testUsfm(usfm)
})
it("preserves pb", () => {
    const usfm = chapter +
        `\\pb`
    testUsfm(usfm)
})
it("preserves v", () => {
    const usfm = chapter +
        `\\v 15 Space // between`
    testUsfm(usfm)
})
it("preserves v", () => {
    const usfm = chapter +
        `\\v 16 Space~nbsp`
    testUsfm(usfm)
})
it("preserves fig", () => {
    const usfm = chapter +
        `\\p Test \\fig fig_content|src="test.tif" size="col" ref="1.31" ` +
        `alt="test image" loc="loc" copy="copy"\\fig*`
    testUsfm(usfm)
})
it("preserves jmp", () => {
    const usfm = chapter +
        `\\p Test \\jmp RSV|link-href=\"prj:RSV52 GEN 1:1\" link-title=\"Revised Standard Version\"\\jmp* Test`
    testUsfm(usfm)
})
it("preserves pro", () => {
    const usfm = chapter +
        `\\p Test \\pro pro_content\\pro* Test`
    testUsfm(usfm)
})
it("preserves rb", () => {
    const usfm1 = chapter +
        `\\p Test \\rb BB|gloss="gg:gg"\\rb* Test`
    testUsfm(usfm1)
    const usfm2 = chapter +
        `\\p Test \\rb BB|"gg:gg"\\rb* Test`
    testUsfm(usfm2)
    const usfm3 = chapter +
        `\\p Test \\rb BBBB|"g1::g3:"\\rb* Test`
    testUsfm(usfm3)
})
/**
 * Usfm-js parses the \w marker differently than the other markers with attributes.
 * Unfortunately, the original order of the attributes may not be preserved since 
 * usfm-js does not tell us what the original order was. Per our code, attributes
 * in alphabetical order will remain in alphabetical order in the output.
 */
it("preserves w", () => {
    const usfm = chapter +
        `\\p \\w most holy|lemma="grace" strong="H6944,H6944" srcloc="gnt5:51.1.2.1"\\w*`
    testUsfm(usfm)
})
it("preserves wh", () => {
    const usfm = chapter +
        `\\p Test \\wh wh_content\\wh* Test`
    testUsfm(usfm)
})
it("preserves wg", () => {
    const usfm = chapter +
        `\\p Test \\wg wg_content\\wg* Test`
    testUsfm(usfm)
})
it("preserves wa", () => {
    const usfm = chapter +
        `\\p Test \\wa wa_content\\wa* Test`
    testUsfm(usfm)
})
it("preserves ndx", () => {
    const usfm = chapter +
        `\\p Test \\ndx ndx_content\\ndx* Test`
    testUsfm(usfm)
})
it("preserves periph", () => {
    const usfm = chapter +
        `\\periph periph_content`
    testUsfm(usfm)
})
/**
 * Milestones are not yet preserved.
 */
xit("preserves qt-s", () => {
    const usfm = chapter +
        `\\v 17 Test \\qt-s qt-s_content \\qt-e`
    testUsfm(usfm)
})
xit("preserves ts-s", () => {
    const usfm = chapter +
        `\\v 18 Test \\ts-s ts-s_content \\ts-e`
    testUsfm(usfm)
})