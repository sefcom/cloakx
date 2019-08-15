
from cloakx.Extension import Extension
import glob
from os.path import join, basename, isdir, splitext, exists
import re
from datetime import datetime
from tqdm import tqdm
import traceback
import sys
from termcolor import cprint


LAST_PASS= 'hdokiejnpimakedhajhdlcegeplioahd'  # Last Pass
GOOGLE_TRANSLATE = 'aapbdbdomjkkjkaonfhkkikfgjllcleb'  # google translat
EVERNOTE = 'pioclpoplcdbaefihamjohnefbikjilc'  # evernote
GHOSTERY = 'mlomiejdfkolichcflejclcbmpeaniij' # ghostery
ALI='papbadoldddalgcjcicnikcfenodpghp'
FB='pachckjkecffpdphbpmfolblodfkgbhl'
CEX1 = "hiajdlfgbgnnjakkbnpdhmhfhklkbiol"
CEX2 = "bihmplhobchoageeokmgbdihknkjbknd"
CEX3 = "pbcgnkmbeodkmiijjfnliicelkjfcldg"
CEX4 = "elioihkkcdgakfbahdoddophfngopipi"
CEX5 = "lifbcibllhkdhoafpjfnlhfpfgnpldfl"
CEX6 = "noaijdpnepcgjemiklgfkcfbkokogabh"
CEX7 = "epcnnfbjfcgphgdmggkamkmgojdagdnn"
CEX8 = "bfeknfgchonpnofdjokchhdhdnddhglm"
CEX9 = "ofoeigeaodhbjogdigckajfhjbonaofg"
CEX10 = "plfknkdmhngcjepkalkhgpmhpolandfp"
CEXTEST = "njhjcpdcjnbehafecnoknepjcoefbgmo"
CEX_DLET= "hffmaknmcikmhiokdocganocmcmakjfp"

class AllExtensions:
    # only_process_ext_list = ['abjcfabbhafbcdfjoecdgepllmpfceif'] # You Tube Magic

    def __init__(self, extensions_base_path):
        only_process = []
        #only_process = ["emdofimlgdflefgpcohmmffijijgoooc","lpgcgfldhlpcekibknamgefpbifakkai","pglicocehinpdckkdgjdlgappmpokadg","iiihoahkpncaheicjfemhjkkfamcahcd","onidcjfimideopiecibkenlependfjhf","ghloaikimachpjjehiahfmmgchkgigil","mnbbpogddcjkeokinbalnoholjclnakj","igbpoppahpjhfedefkkjpbcfbcmidbgm","jfgkgbblaoogmejmddkoimhfchkaaobf","cogehmideinileplalegldhckdgkmjki","kgejglhpjiefppelpmljglcjbhoiplfn","cepbmjgbpkdbkfpocefnpcajdbhnbppn","bgkjebogpemhaiaccnfjlnndgoppbfpk","jpniccbojbdjnnnclhelaenfhfbknlan","pghnioflabfoipnhgjncpjeaogckoijf","ilgcnkbamojgclflamgennaphmheooip","pagpkcopeagjllfeeihnelkhmegofoco","eecfacbppblikmpoomnnngjaaacjgjab","jdoplnjafapjdegjhfhdioihnpppokcg","kibkfgddilddhofjoenplihpggphogaj","pbgafccggboemhmcmnmglkgidbiigoeh","cppaobgnffcgbmlpigglgcncomppjibd","kllohiclobgoaffphlofnjdlabflpgha","bhlchidmlalaccjoechflhbgkgkndjoh","jfeinpeakgoblpcelmhdhajmdoeoifap","mlaomkbolndecpefenllmdlgbmoooopk","geelfhphabnejjhdalkjhgipohgpdnoc","ohmkcnojelglgphmkgmofjlmpoelccjh","ghgociajogpiafbjkidkbdiokbglbgop","ogndojjljhcddnfnjhiibdkpbngkcmhk","bhopfldlicecjkdoidhjfkhbndcjfomf","kdfieneakcjfaiglcfcgkidlkmlijjnh","hehhephbkeafmmgbbnfpkeliaegjoohe","pcdoblfpenaihgkgnkklbgdnanolojgo","ompkhpfgcljnliggppohceaggjljpgdn","enfbnhdcmcipeoakalehejknkpbajodp","fphobimaifjlhdekpjepjiihaajhlodf","hfnbbbkabnehoejfhcbbhdicagcoobji","eblkaoppobdmdppiifkcadeemfhgbecm","heholflhmbcnegoafailfdchnohgobcj","ichedgcpchehiiaeigfdihkhekihhaml","pimdjcpddalobmcjjbbadoignmiepkmc","onmbpohkcnahnioiceofnklkkhcceepg","bfbkdockgkljedoehmoeleefmdbepgek","akhamklknibionleflabebgeikdookmp","hpebdgajeeaedmamechfomdmicpefhmh","gkkggkihdjikhjchneilgkkmleaocjba","bmiedopcajpcehbbfglefijfmmndcaoa","obolbfgholjdjdceehhkahcjghgmpfck","ccgbaemhenilgfijfdhnnbkiinjlklkl","idbbphkedeolfacmclkgpfpnfjoineik","fdjhdmbgchbkegliheakmilngebcoaoh","gcpnidlnikdplcmejolmpgbgkoekejgd","gdddhmocaakbmfegpnihibpjodpbphco","aldepjpjcfpolfolpbbjjcbpjpjnlkok","mifijlamcnbhdcnndajndjckldmofnmg","mfacblegickmnfpaebakfnlbfhpoegin","ldnkbpnnflkilmflaggpbbpeeejofnfd","dckjkjmpaacmdmabanicecmdphlpjpao","edlabnkomhapginaagocjphimjellekl","pebeiooilphfmbohdbhbomomkkoghoia","doohfaodopghljebgbonnakbhnpdgofl","hnjdjcnifgdeehmhbclmhpfgpjoapici","fcpmbggdjpmbddkeefeldkdhkanlgpol","edkhhknjikanmpliacdifeccjiaekjlf","ikoaeincpjdnbkihbdmimakdeofdlopm","ekpjfhgkkihelhidjbmjojlgmkokdolb","cjdjjcogohelcimjlngmoeeaadjlkjai","mbjbmfodjhgdjgadgaghldiplhmnmbod","caabpknjebejiiohmlllhmhmahaahgeo","cbdbjbpbpkmfjkbjggdmhnapnoolgekm","dpbmaailbddmlaepmmdaieeiplhnlfgp","jhlfkahgebegelcbjbmohhiejffgnhkp","jefpknpgklhhhnagffflpaffceilmohg","apophhchmejflociabfgfdjcapkglaoj","djoiockenodagmcjfijgngnjfhcocfcd","ppejmaapfaehlikmnkbmlhbmhniacpon","llanffknhjpafpgnladbcfmondhikcjj","kfljpkcacgcnnnipmdlgmlnmckmcpoef","cocfpflopeggonngdogkclcgfgegcfmj","gokiejffackpoendgmlbknlinpdabmka","nkoinnmalehnbpidghkbkdgmaefkahkb","kmcbdogdandhihllalknlcjfpdjcleom","hnfhkoglifghiefamgnfkkojdpggkaec","chnbjkkhdgnganjknhijnddaemlkbplo","nhhdkjobeklkdcimmjoodcgdagfkmfck","eadlhjnflgcphelofamlbhmofihjpgpk","gijlobangojajlbodabkpjpheeeokhfa","innflepfdbcnhiiemhckbneipmmnknhp","haalnafckjgfngmbggfigkilgimjohog","kdhfnflkenidbdcanbnapbhokdplddoj","amegdihgpgkempfnaijolncbklcabjno","ekahpenefeneekjoanbhkodldleballn","bpljiaolplbbilhhldeaenmpimkfgcnl","nabkcdhkenbenbbmgoblmgiihcfgbcbc","boaldbonhjahlifomlfompdicecodccc","heaefcmpofpjdgaoalohpcaikplaogii","akmnhnifmdldjnemjjgbomegndolcoec"]
        # new additions from hunted list
        #only_process = ['aedanoabbbceoffbdkfdeccfpijfaoja', 'aedmpdookgbneegaeajpoldpnpfbpmlb', 'akcklaakoafabldgdflkbnfmopadnfcn', 'aldepjpjcfpolfolpbbjjcbpjpjnlkok', 'bhecennlklhbbeofdfaabhlkklhikfjl', 'bhkmkdoaaodjbcemiienppccafbgagfl', 'biiammgklaefagjclmnlialkmaemifgo', 'cebbkejpbpellmckfekfkheohdfpbcng', 'cepbmjgbpkdbkfpocefnpcajdbhnbppn', 'cgaocdmhkmfnkdkbnckgmpopcbpaaejo', 'cmnlfmgbjmaciiopcgodlhpiklaghbok', 'dkehgapnhfhohfhalnnelmefnappjoao', 'dkikgjnnnbeomgjfggolflkkjehfaecm', 'doffncgoafdkebbbabbgidkhkiccfolf', 'eblkaoppobdmdppiifkcadeemfhgbecm', 'eejhlkhpanhagmjdejlnajlbhhmbhibm', 'ehppmneigakajibbiloapmleediohkic', 'hffmaknmcikmhiokdocganocmcmakjfp', 'hfjeoakdkjcjihdboiljghdcneiagmpb', 'hfnbbbkabnehoejfhcbbhdicagcoobji', 'hnjdjcnifgdeehmhbclmhpfgpjoapici', 'hpebdgajeeaedmamechfomdmicpefhmh', 'ibpfndfnfoppkngodblpdnjgimoccekg', 'igakkofnljcopkhnfhaoepgeacidbhge', 'ihddbcoiljijedigabknonbnbfljnhpj', 'ihoajedonhepnplmfgdkdjohbmadckdk', 'imamemhokkdleoelohnmkimbmpfglcil', 'jadkoidjfclfpmifedgfjaaglcbacmkg', 'jefpknpgklhhhnagffflpaffceilmohg', 'joknkidihdjigogoclcheaofmdfhhgfh', 'kaeiodnnnppkeigajcclncalmcggagdg', 'lokadhdaghfjbmailhhenifjejpokche', 'mjnjmapkobajfjonbllpfkknbfjndpne', 'mlaomkbolndecpefenllmdlgbmoooopk', 'mmdoimdghkdfbockfhigkohhfjokikmj', 'mppokalcmhmndolgakikfkbpeabgjbkl', 'nbccjeeblefkmoohdiipbghgikopimnd', 'nklebbnebnlkkacogellhhbmifmekllg', 'nkmajmlfckcifcjnhlchdjhkbjcebafk', 'nolfdioiaflbmnajmbcffhmlikipjoaa', 'npfeahicbknalnphfgnamdokmknaidni', 'obheeflpdipmaefcoefhimnaihmhpkao', 'ojoeblnpmednmebhklpdghncobbjiooi', 'palcdpnojkmdjpkdcldniiefhdokbojb', 'pkehgijcmpdhfbdbbnkijodmdjhbjlgp', 'pnfeabmgbcajccckcpdjbepncmoacfdo']
        #only_process = ['achbehnmipmphllfekbgjjdmhehbgoce','addicplhjpoiijeikkiojoolgkbfclng','bhbmkgnfkhpcbpeaclaknfiiklknplnf','dlapbpopbcangbnjdhajdlanbfokjaja','dmjimhgmfmldekckbojggjdijpollpeg','ipnoalfffblkaodfmipjjgkfbgcfadad','kopmeijgmcgmcngnaaedmmiggcnojdao','lhobbakbeomfcgjallalccfhfcgleinm','mgkbopjdbndiklnmfimkeejlimmhhaee','ndjikafbhihkgcmfpklmfnfhcfefflbo','npkdfjeipmpihfghghbpaaknkljllemh','nploddnhipadnaokbofbbamemdgljile','npoeffofpjieegkpgjmjpnamileinmjj','pkdaehnlimdebdbjjgocgaiknchfpnli']
        #only_process = ['abbohodoifkfgoeggpgdcepfkoghoaam', 'adjbnnmnmbdmgohjopaebaaneclmihfm', 'aechfppapbojcbgfiipkdocfiegkchmb', 'afacfppcedpinkojedhcaokjbfihiebp', 'afebdminlpfbpiblbjmaifbcganpkmaj', 'akcklaakoafabldgdflkbnfmopadnfcn', 'akhamklknibionleflabebgeikdookmp', 'akmnhnifmdldjnemjjgbomegndolcoec', 'aldepjpjcfpolfolpbbjjcbpjpjnlkok', 'amegdihgpgkempfnaijolncbklcabjno', 'annigjkddkgaijklpdjpeiachbcpegnn', 'apbcbajfmbebffligfnjfnmmnhkjpjpj', 'apophhchmejflociabfgfdjcapkglaoj', 'bbjhfljjadeplkjkicakncilmmlhlokf', 'bchnamjcpocgphheheekmchilaabjdnb', 'behdklnbkeffkfmlenbcnneladadmfli', 'bfbkdockgkljedoehmoeleefmdbepgek', 'bgkjebogpemhaiaccnfjlnndgoppbfpk', 'bhlchidmlalaccjoechflhbgkgkndjoh', 'bhopfldlicecjkdoidhjfkhbndcjfomf', 'bmhcbmnbenmcecpmpepghooflbehcack', 'bmiedopcajpcehbbfglefijfmmndcaoa', 'bmndhenalpjnldpihlofieooecbloldn', 'boaldbonhjahlifomlfompdicecodccc', 'bpljiaolplbbilhhldeaenmpimkfgcnl', 'caabpknjebejiiohmlllhmhmahaahgeo', 'cadbdjbggmkhbjddfacdlkkdfdohajgj', 'cbdbjbpbpkmfjkbjggdmhnapnoolgekm', 'cbimabofgmfdkicghcadidpemeenbffn', 'cbjngbfjehiofmihfpodinolkcokdojp', 'ccgbaemhenilgfijfdhnnbkiinjlklkl', 'cepbmjgbpkdbkfpocefnpcajdbhnbppn', 'cfafloknjegbmpkhaaoacllnngplcppa', 'chnbjkkhdgnganjknhijnddaemlkbplo', 'cjdjjcogohelcimjlngmoeeaadjlkjai', 'ckecdkhdccmhijackbigkeddkcnljknd', 'cnnmjeggdmicjojlnjghdgkdlijiobke', 'cocfpflopeggonngdogkclcgfgegcfmj', 'cogehmideinileplalegldhckdgkmjki', 'cppaobgnffcgbmlpigglgcncomppjibd', 'dccmnjciogmmahaogjgkocongokmieog', 'dcdhcaiphjchoklnfjafghlgahifnmma', 'dckjkjmpaacmdmabanicecmdphlpjpao', 'ddjmclelajjfbfpackdopclijddlopep', 'dibjolekoofgnehcoecjjokehebncdhp', 'dihlakmbcgnjejelioimfmlahhjagfpa', 'dipegmpcgkdhknmnhjjfnfmhhpdkigeb', 'djoiockenodagmcjfijgngnjfhcocfcd', 'doocmbmlcnbbdohogchldhlikjpndpng', 'doohfaodopghljebgbonnakbhnpdgofl', 'dpbmaailbddmlaepmmdaieeiplhnlfgp', 'dpendhnfdpinogilphiafboldnfolpdi', 'eadlhjnflgcphelofamlbhmofihjpgpk', 'eblkaoppobdmdppiifkcadeemfhgbecm', 'edkhhknjikanmpliacdifeccjiaekjlf', 'edlabnkomhapginaagocjphimjellekl', 'eecfacbppblikmpoomnnngjaaacjgjab', 'eedcimkmkahdmbdfdfkbcionokachfjh', 'egfnnnfdmdpjaelfbndjfclonlfpfacf', 'ehefhcfcbedmkchmelljnfjnebbficcd', 'ekahpenefeneekjoanbhkodldleballn', 'ekhfapehhkdanmgjkgagafnilhomfkek', 'ekpjfhgkkihelhidjbmjojlgmkokdolb', 'elflbehbhjfjgfkabalcojanmmdkhhek', 'emdofimlgdflefgpcohmmffijijgoooc', 'enfbnhdcmcipeoakalehejknkpbajodp', 'eodccemmopepiegcokmpfmbjponimpbd', 'epckjefillidgmfmclhcbaembhpdeijg', 'fcpmbggdjpmbddkeefeldkdhkanlgpol', 'fddhonoimfhgiopglkiokmofecgdiedb', 'fdjhdmbgchbkegliheakmilngebcoaoh', 'fhhdlnnepfjhlhilgmeepgkhjmhhhjkh', 'fkkiledfpofpabjblkjjeapmiiedjndm', 'fmbcdhjmhddnnpeomknikdbboejbhdcl', 'fphobimaifjlhdekpjepjiihaajhlodf', 'gcpnidlnikdplcmejolmpgbgkoekejgd', 'gdahdckfamodilgodnphjbihfhghkdag', 'gdbojpeicfhjmehcbbpffcdbifgikgjl', 'gdddhmocaakbmfegpnihibpjodpbphco', 'geelfhphabnejjhdalkjhgipohgpdnoc', 'ghgociajogpiafbjkidkbdiokbglbgop', 'ghloaikimachpjjehiahfmmgchkgigil', 'gijlobangojajlbodabkpjpheeeokhfa', 'gkkggkihdjikhjchneilgkkmleaocjba', 'gklfcaofjmilchcphdgbhjeoopdaejje', 'gokiejffackpoendgmlbknlinpdabmka', 'haalnafckjgfngmbggfigkilgimjohog', 'hadcfiekcaagaenlojddigpocfpambep', 'heaefcmpofpjdgaoalohpcaikplaogii', 'hehhephbkeafmmgbbnfpkeliaegjoohe', 'heholflhmbcnegoafailfdchnohgobcj', 'heidbfcbfdcinibnlglfpbjdokofnkje', 'hffmaknmcikmhiokdocganocmcmakjfp', 'hfnbbbkabnehoejfhcbbhdicagcoobji', 'hiaoiehpkillodoeillmodjcadmfmcbg', 'hiohikggdjlojnlhbkahkkeggklamphf', 'hnfhkoglifghiefamgnfkkojdpggkaec', 'hnjdjcnifgdeehmhbclmhpfgpjoapici', 'hpebdgajeeaedmamechfomdmicpefhmh', 'hpogcmdfckfmekhfpbfhfgbhpobldohl', 'ibedflgkbfilnoebblpafhnihffahhgg', 'ibgjbjnjknkohmdoijjfcdhoomffoiae', 'ibgkfepjabgnmpjojcnbcjfgeoklfdfk', 'ichedgcpchehiiaeigfdihkhekihhaml', 'idbbphkedeolfacmclkgpfpnfjoineik', 'ieckednlhijfcgddfelipbdddejkcapp', 'iejckekdjogeeilmllnabmgkbbmedeal', 'igbpoppahpjhfedefkkjpbcfbcmidbgm', 'igghcjipopchdolaihpdbidmddooojml', 'igkjmhojoidafbjbpffnplcnhabjmden', 'iiihoahkpncaheicjfemhjkkfamcahcd', 'ikmdmhifkmnmhdgcadinmpocdnjekicg', 'ikoaeincpjdnbkihbdmimakdeofdlopm', 'ilgcnkbamojgclflamgennaphmheooip', 'imofnopodmphgihdnpjgnfinpfkilkge', 'inhgmomaeckcbfflfebaegknfnjmnldo', 'innflepfdbcnhiiemhckbneipmmnknhp', 'iohkcmicmhmhaojemlkacpcjhcccgpdn', 'iompkemhffikhdjidlbakglddbofhbej', 'jcankddlhambomjmegjefebfafkbddhl', 'jdoplnjafapjdegjhfhdioihnpppokcg', 'jefpknpgklhhhnagffflpaffceilmohg', 'jfeinpeakgoblpcelmhdhajmdoeoifap', 'jfgkgbblaoogmejmddkoimhfchkaaobf', 'jgfgdgkipplhaiggoplpallikmheichc', 'jhlfkahgebegelcbjbmohhiejffgnhkp', 'jlhoacblbnkifbpdkepeodekkdkodlie', 'jofjnbepnhcbfnpbhchillofcgpeopaj', 'jpniccbojbdjnnnclhelaenfhfbknlan', 'kcdjnggbbjlekikjbapjiealljbcbhcd', 'kdfieneakcjfaiglcfcgkidlkmlijjnh', 'kdhfnflkenidbdcanbnapbhokdplddoj', 'kfljpkcacgcnnnipmdlgmlnmckmcpoef', 'kgejglhpjiefppelpmljglcjbhoiplfn', 'kibkfgddilddhofjoenplihpggphogaj', 'kikfnibgegiogngdffdibdhkhgjkfglj', 'kkccbhhmconjnnknidkolknogjdbiiab', 'kllohiclobgoaffphlofnjdlabflpgha', 'kmcbdogdandhihllalknlcjfpdjcleom', 'kobbebjdlkjcdbnnonblhfofcajfkigj', 'kopnhhhdecobcbdhhdcpmjlahmakiema', 'lblnfpdcingncbnkpodomelmnnhpkmbg', 'ldfboinpfdahkgnljbkohgimhimmafip', 'ldnkbpnnflkilmflaggpbbpeeejofnfd', 'lecpgebdijhcmeehmcdallaaejphpmcb', 'lehjmneogjhhipgllpljinjicgoldekf', 'lkajnchmhjldgjoecppdkinfgimhjmeg', 'lkjejgoogbgnhfdoglcghhmhakknigig', 'llanffknhjpafpgnladbcfmondhikcjj', 'llkjkofpgedcknjggdifdhlhollakoek', 'lmlnplkfbiihcpkghkkmfefjdaccmbcc', 'lpgcgfldhlpcekibknamgefpbifakkai', 'mbjbmfodjhgdjgadgaghldiplhmnmbod', 'mbmnchcghndejohlahcjfhmiocgiklbn', 'mfacblegickmnfpaebakfnlbfhpoegin', 'mhdcaiodhdpcjcphclghpmlpmfgmibng', 'mifijlamcnbhdcnndajndjckldmofnmg', 'mlaomkbolndecpefenllmdlgbmoooopk', 'mnbbpogddcjkeokinbalnoholjclnakj', 'nabkcdhkenbenbbmgoblmgiihcfgbcbc', 'nabpcgbikmeeebpnalabkffnbfhggcig', 'nbbhnilhdcejikknfjmafnceaokmmgjp', 'ngpanhjkgblljpbpkapocengafmpheej', 'nhhdkjobeklkdcimmjoodcgdagfkmfck', 'nilaminkjakoilnafcbdpgoidfobgdfd', 'njeebhjilmmcmiikhknfpidmgeohkadh', 'njhjcpdcjnbehafecnoknepjcoefbgmo', 'nkoinnmalehnbpidghkbkdgmaefkahkb', 'nlnlpbnejgapglnnggbpkiknkcdjdalo', 'nmeoibhnikioaihlkpfajfnjbhkbpchp', 'oadohiloeinlhonemkjlnoiiibjgipeb', 'obolbfgholjdjdceehhkahcjghgmpfck', 'odkdoekijebogaiopbjgkgogkgifjfnk', 'oempcppeepempgfcchbphcegjlnoaafg', 'ogndojjljhcddnfnjhiibdkpbngkcmhk', 'ohjmhldioopcachmenfnhlbgmkaohgbb', 'ohmkcnojelglgphmkgmofjlmpoelccjh', 'okbpfbebponpmlbjffjcagceiehnkekb', 'olfjeepflfbeaecgmlphadojomeidpif', 'ompkhpfgcljnliggppohceaggjljpgdn', 'onidcjfimideopiecibkenlependfjhf', 'onmbpohkcnahnioiceofnklkkhcceepg', 'onmlmogimoceeeegmnbjcclkiomkckpb', 'oohkefdofdhgajfidkajmeipejdffeem', 'pagpkcopeagjllfeeihnelkhmegofoco', 'panhbjhhhpldcicghpekhonnmfnpgibd', 'pbadmelojclloofgofgflmjdkfdpfddo', 'pbgafccggboemhmcmnmglkgidbiigoeh', 'pbkgodffljfhdlinelnhklhcdoiedbej', 'pbnndmlekkboofhnbonilimejonapojg', 'pcdoblfpenaihgkgnkklbgdnanolojgo', 'pckcnakclkpcbbmkogfkcilplchlabhb', 'pebeiooilphfmbohdbhbomomkkoghoia', 'pecoijjbnfgchbingannphbflnoaeooc', 'pghnioflabfoipnhgjncpjeaogckoijf', 'pgjalheaoofikjfidelgbldglgnhmfle', 'pglicocehinpdckkdgjdlgappmpokadg', 'pgpkffaeaeimknjhekbodlehaejellln', 'pimdjcpddalobmcjjbbadoignmiepkmc', 'pkdaehnlimdebdbjjgocgaiknchfpnli', 'ppejmaapfaehlikmnkbmlhbmhniacpon', 'knekbkhffeelkbilpcdpgbdpeandanfj', 'hdnelbhngejbdmjafnifamedicdaombc']
        #only_process = ['fmbcdhjmhddnnpeomknikdbboejbhdcl', 'pckcnakclkpcbbmkogfkcilplchlabhb', 'jofjnbepnhcbfnpbhchillofcgpeopaj']
        #only_process = [] #[ 'fignonfnbbdfoopnocchnkpjnfhamaab' ]
        #only_process = [ 'akdgnmcogleenhbclghghlkkdndkjdjc' ]
        #only_process = ['djibejkjnciejcldejbajiihmickgloe','oimoiefndijdcjpphcgldokllodoaihe','plgpgjiokmlpfgkkgjejghlpobnhione']
        #only_process = ['ahpnencomoimdlbgceinogcjpglcgnfh', 'bhlgcajaekghmlkcpjceibpfcoehhgal']
        #only_process = ['ialcdhlddbiciodiejeligmbbddbcadg']
        #only_process = ['plpfboikjdjiigdfknoohjopodfkenbn']
        #only_process = ['gifllahgdeogmfooohjdgbhlpnjbacab']
        if exists(extensions_base_path + "/only_process.dat") and len(only_process) == 0:
            only_process = open(extensions_base_path + "/only_process.dat").readlines()
            only_process = [x.strip() for x in only_process]
            cprint("[*] Only Processing the {} included in only_process".format(len(only_process)), "green")

        arr_processed = open ("data/processed.dat","r").read().split("\n")
        already_processed = set()
        for appid in arr_processed:
            already_processed.add(appid)
        self._total_ext_cnt = 0
        #applist = [CEX_DLET]
        self.all_exts = []
        self.base_path = extensions_base_path
        appid_pattern = re.compile("^([a-p]{32})$")

        ext_dirs = glob.iglob(join(self.base_path, "*"))
        list_dirs = []
        for cex_report in ext_dirs:
            list_dirs.append(cex_report)

        for i in tqdm(range(0, len(list_dirs)), desc="Loading Extensions"):

            cex_loc = list_dirs[i]
            # if i > 7961:
            #     print ("dbg:{}".format(cex_loc))
            if isdir(cex_loc):
                appid = basename(cex_loc)
            else:
                appid = splitext(basename(cex_loc))[0]
                if isdir(splitext(cex_loc)[0]):
                    # it's already been extracted so skip it and do the directory instead
                    continue

            if appid_pattern.match(appid):
                if len(only_process) > 0:
                    if appid not in only_process:
                        continue
                    if appid in already_processed:
                        continue
                else:
                    if appid in already_processed:
                        continue

                try:
                    #print(appid)
                    ext = Extension(cex_loc)
                    self.all_exts.append(ext)

                except Exception as ex:
                    open("data/processed.dat", "a").write(appid + "\n")
                    open("data/failed.dat", "a").write(appid + "\n")
                    print("SKIPPING {} {}".format(appid, ex))

                    exc_type, exc_value, exc_traceback = sys.exc_info()
                    print("*** print_tb:")
                    traceback.print_tb(exc_traceback, limit=1, file=sys.stdout)

        print("loading completed")

    def check_wars_exist(self):
        tot = 0
        no_declared_wars = 0
        has_declared_wars = 0
        for ex in self.all_exts:
            tot += 1
            if ex.has_wars_declared():
                has_declared_wars += 1
            else:
                cprint("{} has no declared wars ".format(ex.getappid()), "yellow")
                no_declared_wars += 1

        cprint("{} extensions have no declared wars and {} extensions have at least one; TOTAL tested = {} "
               .format(no_declared_wars, has_declared_wars, tot), "blue")


    def cloak_all(self, tajs_analysis_only=False, do_war_only=False):
        failed_cloaks = []
        success = True
        total_left = len(self.all_exts)
        current_ext_cnt = 1
        for ex in self.all_exts:
            open("data/processed.dat", "a").write(ex.getappid()+"\n")
            print("Analyzing {} [{}/{}] it has {} WARs and {} War Search Tokens Started at {}"
                  .format(ex.getappid(), current_ext_cnt, total_left,
                          ex.num_of_wars, ex.num_of_war_search_toks, datetime.now().strftime('%H:%M:%S')))

            if (tajs_analysis_only):
                success = success and ex.dropplet_cloak(droponly=True)
            elif(do_war_only):
                success = ex.cloak()
            else:
                success = ex.cloak()
                success = success and ex.dropplet_cloak(droponly=False)

            if not success:
                open("data/failed.dat", "a").write(ex.getappid() +"\n")
                print ("!!!!!!!!!!!!!!!!!!!!!! FAILED AND ADDING ex")
                failed_cloaks.append(ex)
            else:
                open("data/success.dat", "a").write(ex.getappid() +"\n")
                #print (" ============================== [ DONE ] ==============================")

            current_ext_cnt += 1

        return failed_cloaks

class PoolProgress:

    def __init__(self, pool, update_interval=3):
        self.pool = pool
        self.update_interval = update_interval

    def track(self, job):
        task = self.pool._cache[job._job]
        while task._number_left > 0:
            print("Tasks remaining = {0}".format(task._number_left * task._chunksize))
            sleep(self.update_interval)
