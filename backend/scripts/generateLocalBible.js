const fs = require('fs');
const path = require('path');

console.log('📖 Generare baza de date versete din surse locale...');

// Versete complete si verificate din Biblia Cornilescu
const verseteComplete = [
  // GENEZA
  { carte: "Geneza", abreviere: "Gen", testament: "VT", capitol: 1, verset: 1, text: "La inceput, Dumnezeu a facut cerurile si pamantul.", referinta: "Gen 1:1" },
  { carte: "Geneza", abreviere: "Gen", testament: "VT", capitol: 1, verset: 3, text: "Dumnezeu a zis: Sa fie lumina! Si a fost lumina.", referinta: "Gen 1:3" },
  { carte: "Geneza", abreviere: "Gen", testament: "VT", capitol: 1, verset: 27, text: "Dumnezeu a facut pe om dupa chipul Sau, l-a facut dupa chipul lui Dumnezeu; parte barbateasca si parte femeiasca i-a facut.", referinta: "Gen 1:27" },
  { carte: "Geneza", abreviere: "Gen", testament: "VT", capitol: 28, verset: 15, text: "Iata, Eu sunt cu tine; te voi pazi pretutindeni pe unde vei merge si te voi aduce inapoi in tara aceasta; caci nu te voi parasi pana nu voi implini ce iti spun.", referinta: "Gen 28:15" },
  // EXODUL
  { carte: "Exodul", abreviere: "Ex", testament: "VT", capitol: 14, verset: 14, text: "Domnul Se va lupta pentru voi; dar voi stati linistiti.", referinta: "Ex 14:14" },
  { carte: "Exodul", abreviere: "Ex", testament: "VT", capitol: 20, verset: 3, text: "Sa nu ai alti dumnezei afara de Mine.", referinta: "Ex 20:3" },
  // DEUTERONOM
  { carte: "Deuteronomul", abreviere: "Deut", testament: "VT", capitol: 31, verset: 6, text: "Fiti tari si curajosi, nu va temeti si nu va infricosati inaintea lor; caci Domnul, Dumnezeul tau, merge El insusi cu tine, nu te va parasi si nu te va lasa.", referinta: "Deut 31:6" },
  { carte: "Deuteronomul", abreviere: "Deut", testament: "VT", capitol: 6, verset: 5, text: "Sa iubesti pe Domnul, Dumnezeul tau, cu toata inima ta, cu tot sufletul tau si cu toata puterea ta.", referinta: "Deut 6:5" },
  // IOV
  { carte: "Iov", abreviere: "Iov", testament: "VT", capitol: 19, verset: 25, text: "Stiu ca Rascumparatorul meu este viu si ca Se va ridica la urma pe pamant.", referinta: "Iov 19:25" },
  // PSALMI
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 1, verset: 1, text: "Ferice de omul care nu se duce la sfatul celor rai, nu se opreste pe calea pacatosilor si nu se aseaza pe scaunul celor batjocoritori!", referinta: "Ps 1:1" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 1, verset: 2, text: "Ci isi gaseste placerea in Legea Domnului, si zi si noapte cugeata la Legea Lui!", referinta: "Ps 1:2" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 8, verset: 1, text: "Doamne, Dumnezeul nostru, cat de minunat este Numele Tau pe tot pamantul!", referinta: "Ps 8:1" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 16, verset: 8, text: "Intotdeauna am pe Domnul inaintea mea: cand El este la dreapta mea, nu ma clatina.", referinta: "Ps 16:8" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 18, verset: 2, text: "Domnul este stanca mea, cetatea mea intarita si Izbavitorul meu; Dumnezeu este stanca mea in care gasesc un adapost.", referinta: "Ps 18:2" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 19, verset: 1, text: "Cerurile spun slava lui Dumnezeu si intinderea lor vesteste lucrarea mainilor Lui.", referinta: "Ps 19:1" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 22, verset: 1, text: "Dumnezeule, Dumnezeule, pentru ce m-ai parasit? Pentru ce stai departe de mine, departe de cuvintele gemetelor mele?", referinta: "Ps 22:1" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 23, verset: 1, text: "Domnul este Pastorul meu: nu voi duce lipsa de nimic.", referinta: "Ps 23:1" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 23, verset: 2, text: "El ma paste in pasuni verzi si ma duce la ape de odihna.", referinta: "Ps 23:2" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 23, verset: 3, text: "Imi invivoreaza sufletul si ma povatuieste pe carari drepte, din pricina Numelui Sau.", referinta: "Ps 23:3" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 23, verset: 4, text: "Chiar daca ar fi sa umblu prin valea umbrei mortii, nu ma tem de niciun rau, caci Tu esti cu mine. Toiagul si nuiaua Ta ma mangaie.", referinta: "Ps 23:4" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 23, verset: 6, text: "Da, fericirea si indurarea ma vor insoti in toate zilele vietii mele, si voi locui in Casa Domnului pana la sfarsitul zilelor mele.", referinta: "Ps 23:6" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 24, verset: 1, text: "Al Domnului este pamantul cu tot ce cuprinde el, lumea si cei ce o locuiesc!", referinta: "Ps 24:1" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 27, verset: 1, text: "Domnul este lumina si mantuirea mea: de cine sa ma tem? Domnul este sprijinitorul vietii mele: de cine sa ma infricosez?", referinta: "Ps 27:1" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 27, verset: 14, text: "Nadajduieste in Domnul! Fii tare, imbarbateaza-ti inima si nadajduieste in Domnul!", referinta: "Ps 27:14" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 28, verset: 7, text: "Domnul este taria mea si scutul meu: in El mi s-a increzut inima si am capatat ajutor; de aceea imi salta inima de bucurie.", referinta: "Ps 28:7" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 30, verset: 5, text: "Caci manirea Lui tine numai o clipa, dar bunavointa Lui tine toata viata; seara vine plansul, dar dimineata vine strigatul de bucurie.", referinta: "Ps 30:5" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 31, verset: 15, text: "In mainile Tale imi incred duhul meu: Tu ma vei rascumpara, Doamne, Dumnezeul credinciosiei.", referinta: "Ps 31:15" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 32, verset: 8, text: "Iti voi da invatatura si te voi invata calea pe care trebuie s-o urmezi; te voi sfatui, avand privirea indreptata spre tine.", referinta: "Ps 32:8" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 34, verset: 8, text: "Gustati si vedeti ca bun este Domnul! Ferice de omul care se increde in El!", referinta: "Ps 34:8" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 34, verset: 18, text: "Domnul este aproape de cei cu inima zdrobita si mantuieste pe cei cu duhul inabusit.", referinta: "Ps 34:18" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 37, verset: 4, text: "Delecteaza-te in Domnul si El iti va da tot ce-ti doreste inima.", referinta: "Ps 37:4" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 37, verset: 5, text: "Incredinteaza Domnului calea ta, bazeaza-te pe El si El va lucra.", referinta: "Ps 37:5" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 40, verset: 1, text: "Am nadajduit cu incredere in Domnul si El s-a plecat spre mine si mi-a auzit strigatul.", referinta: "Ps 40:1" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 42, verset: 1, text: "Cum suspina cerbul dupa raurile de apa, asa suspina sufletul meu dupa Tine, Dumnezeule!", referinta: "Ps 42:1" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 46, verset: 1, text: "Dumnezeu este adapostul si sprijinul nostru, un ajutor care nu lipseste niciodata in nevoi.", referinta: "Ps 46:1" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 46, verset: 10, text: "Opriti-va si stiti ca Eu sunt Dumnezeu! Eu vreau sa fiu inaltat printre neamuri, inaltat pe pamant.", referinta: "Ps 46:10" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 51, verset: 10, text: "Zideste in mine o inima curata, Dumnezeule, pune in mine un duh nou si statornic!", referinta: "Ps 51:10" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 55, verset: 22, text: "Arunca-ti povara asupra Domnului si El te va sprijini; El nu va ingadui niciodata ca cel drept sa se clatine.", referinta: "Ps 55:22" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 56, verset: 3, text: "In ziua cand ma tem, ma incred in Tine.", referinta: "Ps 56:3" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 62, verset: 5, text: "Da, suflete, odihneste-te numai in Dumnezeu, caci de la El imi vine nadejdea.", referinta: "Ps 62:5" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 63, verset: 1, text: "Dumnezeule, Tu esti Dumnezeul meu; pe Tine Te caut de dimineata; sufletul meu este insetat de Tine.", referinta: "Ps 63:1" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 71, verset: 5, text: "Caci Tu esti nadejdea mea, Doamne Dumnezeule! In Tine ma incred din tineretile mele.", referinta: "Ps 71:5" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 84, verset: 11, text: "Caci Domnul Dumnezeu este un soare si un scut; Domnul da har si slava si nu lipseste de niciun bine pe cei ce duc o viata fara prihana.", referinta: "Ps 84:11" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 86, verset: 5, text: "Caci Tu, Doamne, esti bun si gata sa ierti, si plin de bunatate fata de toti cei ce Te cheama.", referinta: "Ps 86:5" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 90, verset: 1, text: "Doamne, Tu ne-ai fost un adapost din neam in neam!", referinta: "Ps 90:1" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 91, verset: 1, text: "Cel ce locuieste sub ocrotirea Celui Preainalt si se odihneste la umbra Celui Atotputernic.", referinta: "Ps 91:1" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 91, verset: 2, text: "Zice despre Domnul: El este refugiul meu si cetatuia mea, Dumnezeul meu in care ma incred!", referinta: "Ps 91:2" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 91, verset: 4, text: "El te va acoperi cu penele Lui si vei gasi un adapost sub aripile Lui.", referinta: "Ps 91:4" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 91, verset: 11, text: "Caci El va porunci ingerilor Sai sa te pazeasca pe toate caile tale.", referinta: "Ps 91:11" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 100, verset: 4, text: "Intrati pe portile Lui cu laude de multumire, in curtile Lui cu cantari de lauda. Laudati-L, binecuvantati Numele Lui!", referinta: "Ps 100:4" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 103, verset: 1, text: "Binecuvinteaza, suflete, pe Domnul! Tot ce este in mine sa binecuvanteze Numele Lui cel sfant!", referinta: "Ps 103:1" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 103, verset: 2, text: "Binecuvinteaza, suflete, pe Domnul si nu uita niciuna din binefacerile Lui!", referinta: "Ps 103:2" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 103, verset: 13, text: "Cum se indura un tata de copiii lui, asa Se indura Domnul de cei ce se tem de El.", referinta: "Ps 103:13" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 107, verset: 1, text: "Laudati pe Domnul, caci este bun, caci indurarea Lui tine in veci!", referinta: "Ps 107:1" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 116, verset: 1, text: "Iubesc pe Domnul caci El aude glasul meu, cererile mele.", referinta: "Ps 116:1" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 118, verset: 24, text: "Aceasta este ziua pe care a facut-o Domnul: sa ne bucuram si sa ne veselim in ea!", referinta: "Ps 118:24" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 119, verset: 105, text: "Cuvantul Tau este o candela pentru picioarele mele si o lumina pe cararea mea.", referinta: "Ps 119:105" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 121, verset: 1, text: "Imi ridic ochii spre munti: de unde imi va veni ajutorul?", referinta: "Ps 121:1" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 121, verset: 2, text: "Ajutorul meu vine de la Domnul, care a facut cerurile si pamantul.", referinta: "Ps 121:2" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 139, verset: 14, text: "Te laud ca sunt o faptura atat de minunata. Minunate sunt lucrarile Tale si sufletul meu o stie foarte bine.", referinta: "Ps 139:14" },
  { carte: "Psalmi", abreviere: "Ps", testament: "VT", capitol: 145, verset: 18, text: "Domnul este aproape de toti cei ce-L cheama, de toti cei ce-L cheama cu sinceritate.", referinta: "Ps 145:18" },
  // PROVERBE
  { carte: "Proverbe", abreviere: "Prov", testament: "VT", capitol: 3, verset: 5, text: "Increde-te in Domnul din toata inima ta si nu te bizui pe intelepciunea ta!", referinta: "Prov 3:5" },
  { carte: "Proverbe", abreviere: "Prov", testament: "VT", capitol: 3, verset: 6, text: "Recunoaste-L in toate caile tale si El iti va netezi cararile.", referinta: "Prov 3:6" },
  { carte: "Proverbe", abreviere: "Prov", testament: "VT", capitol: 4, verset: 23, text: "Pazeste-ti inima mai mult decat orice, caci din ea ies izvoarele vietii.", referinta: "Prov 4:23" },
  { carte: "Proverbe", abreviere: "Prov", testament: "VT", capitol: 16, verset: 3, text: "Lasa-ti lucrarile in seama Domnului si planurile tale vor izbuti.", referinta: "Prov 16:3" },
  { carte: "Proverbe", abreviere: "Prov", testament: "VT", capitol: 16, verset: 9, text: "Inima omului isi face planuri, dar Domnul ii hotaraste pasii.", referinta: "Prov 16:9" },
  { carte: "Proverbe", abreviere: "Prov", testament: "VT", capitol: 17, verset: 17, text: "Prietenul iubeste oricand si fratele se naste pentru zile de necaz.", referinta: "Prov 17:17" },
  { carte: "Proverbe", abreviere: "Prov", testament: "VT", capitol: 18, verset: 10, text: "Numele Domnului este un turn puternic; cel drept alearga la el si sta la adapost.", referinta: "Prov 18:10" },
  { carte: "Proverbe", abreviere: "Prov", testament: "VT", capitol: 22, verset: 6, text: "Creste copilul pe calea pe care trebuie s-o urmeze si cand va imbatrani nu se va abate de la ea.", referinta: "Prov 22:6" },
  // ECLESIASTUL
  { carte: "Eclesiastul", abreviere: "Ecl", testament: "VT", capitol: 3, verset: 1, text: "Toate isi au vremea lor; orice lucru de sub ceruri isi are ceasul lui.", referinta: "Ecl 3:1" },
  // ISAIA
  { carte: "Isaia", abreviere: "Is", testament: "VT", capitol: 9, verset: 6, text: "Caci un Copil ni s-a nascut, un Fiu ni s-a dat si domnia va fi pe umarul Lui; Il vor numi: Minunat, Sfetnic, Dumnezeu tare, Parintele vesniciilor, Domnul pacii.", referinta: "Is 9:6" },
  { carte: "Isaia", abreviere: "Is", testament: "VT", capitol: 26, verset: 3, text: "Tu ii vei tine in pace deplina pe cel ce se increde in Tine, caci se bizuie pe Tine.", referinta: "Is 26:3" },
  { carte: "Isaia", abreviere: "Is", testament: "VT", capitol: 40, verset: 29, text: "El da tarie celui obosit si mareste puterea celui ce cade.", referinta: "Is 40:29" },
  { carte: "Isaia", abreviere: "Is", testament: "VT", capitol: 40, verset: 31, text: "Dar cei ce se incred in Domnul isi innoiesc puterea, ei zboara ca vulturii; alearga si nu obosesc, umbla si nu ostenesc.", referinta: "Is 40:31" },
  { carte: "Isaia", abreviere: "Is", testament: "VT", capitol: 41, verset: 10, text: "Nu te teme, caci Eu sunt cu tine; nu te uita cu ingrijorare, caci Eu sunt Dumnezeul tau. Eu te intaresc, tot Eu iti vin in ajutor, Eu te sprijin cu dreapta Mea biruitoare.", referinta: "Is 41:10" },
  { carte: "Isaia", abreviere: "Is", testament: "VT", capitol: 43, verset: 1, text: "Dar acum, asa vorbeste Domnul care te-a facut, Iacove, si Cel ce te-a intocmit, Israele: Nu te teme de nimic, caci Eu te-am rascumparat, te-am chemat pe nume: esti al Meu!", referinta: "Is 43:1" },
  { carte: "Isaia", abreviere: "Is", testament: "VT", capitol: 53, verset: 5, text: "Dar El era strapuns pentru pacatele noastre, zdrobit pentru faradelegile noastre. Pedeapsa, care ne da pacea, a cazut peste El, si prin ranile Lui suntem tamaduiti.", referinta: "Is 53:5" },
  { carte: "Isaia", abreviere: "Is", testament: "VT", capitol: 55, verset: 8, text: "Caci gandurile Mele nu sunt gandurile voastre si caile voastre nu sunt caile Mele, zice Domnul.", referinta: "Is 55:8" },
  { carte: "Isaia", abreviere: "Is", testament: "VT", capitol: 55, verset: 9, text: "Ci cat sunt de sus cerurile fata de pamant, atat sunt de sus caile Mele fata de caile voastre si gandurile Mele fata de gandurile voastre.", referinta: "Is 55:9" },
  // IEREMIA
  { carte: "Ieremia", abreviere: "Ier", testament: "VT", capitol: 29, verset: 11, text: "Caci Eu stiu gandurile pe care le am cu privire la voi, zice Domnul, ganduri de pace si nu de raul vostru, ca sa va dau un viitor si o nadejde.", referinta: "Ier 29:11" },
  { carte: "Ieremia", abreviere: "Ier", testament: "VT", capitol: 33, verset: 3, text: "Cheama-Ma si-ti voi raspunde, si iti voi vesti lucruri mari si nespus de grele, pe care nu le cunosti.", referinta: "Ier 33:3" },
  // NAUM
  { carte: "Naum", abreviere: "Naum", testament: "VT", capitol: 1, verset: 7, text: "Bun este Domnul, este un adapost in ziua necazului; El cunoaste pe cei ce cauta ocrotire la El.", referinta: "Naum 1:7" },
  // MATEI
  { carte: "Matei", abreviere: "Mat", testament: "NT", capitol: 5, verset: 3, text: "Ferice de cei saraci in duh, caci a lor este Imparatia cerurilor!", referinta: "Mat 5:3" },
  { carte: "Matei", abreviere: "Mat", testament: "NT", capitol: 5, verset: 4, text: "Ferice de cei ce plang, caci ei vor fi mangaiati!", referinta: "Mat 5:4" },
  { carte: "Matei", abreviere: "Mat", testament: "NT", capitol: 5, verset: 5, text: "Ferice de cei blanzi, caci ei vor mosteni pamantul!", referinta: "Mat 5:5" },
  { carte: "Matei", abreviere: "Mat", testament: "NT", capitol: 5, verset: 6, text: "Ferice de cei ce flamanzesc si inseteaza dupa neprihanie, caci ei vor fi saturati!", referinta: "Mat 5:6" },
  { carte: "Matei", abreviere: "Mat", testament: "NT", capitol: 5, verset: 7, text: "Ferice de cei milostivi, caci ei vor capata mila!", referinta: "Mat 5:7" },
  { carte: "Matei", abreviere: "Mat", testament: "NT", capitol: 5, verset: 8, text: "Ferice de cei cu inima curata, caci ei vor vedea pe Dumnezeu!", referinta: "Mat 5:8" },
  { carte: "Matei", abreviere: "Mat", testament: "NT", capitol: 5, verset: 9, text: "Ferice de cei impaciuitori, caci ei vor fi chemati fii ai lui Dumnezeu!", referinta: "Mat 5:9" },
  { carte: "Matei", abreviere: "Mat", testament: "NT", capitol: 5, verset: 14, text: "Voi sunteti lumina lumii. O cetate asezata pe un munte nu poate sa ramana ascunsa.", referinta: "Mat 5:14" },
  { carte: "Matei", abreviere: "Mat", testament: "NT", capitol: 6, verset: 33, text: "Cautati mai intai Imparatia lui Dumnezeu si neprihania Lui si toate aceste lucruri vi se vor da pe deasupra.", referinta: "Mat 6:33" },
  { carte: "Matei", abreviere: "Mat", testament: "NT", capitol: 7, verset: 7, text: "Cereti si vi se va da; cautati si veti gasi; bateti si vi se va deschide.", referinta: "Mat 7:7" },
  { carte: "Matei", abreviere: "Mat", testament: "NT", capitol: 11, verset: 28, text: "Veniti la Mine, toti cei truditi si impovarati si Eu va voi da odihna.", referinta: "Mat 11:28" },
  { carte: "Matei", abreviere: "Mat", testament: "NT", capitol: 11, verset: 29, text: "Luati jugul Meu asupra voastra si invatati de la Mine, caci Eu sunt bland si smerit cu inima; si veti gasi odihna pentru sufletele voastre.", referinta: "Mat 11:29" },
  { carte: "Matei", abreviere: "Mat", testament: "NT", capitol: 19, verset: 26, text: "Isus S-a uitat la ei si le-a zis: La oameni lucrul acesta este cu neputinta, dar la Dumnezeu toate lucrurile sunt cu putinta.", referinta: "Mat 19:26" },
  { carte: "Matei", abreviere: "Mat", testament: "NT", capitol: 28, verset: 20, text: "Invatati-i sa pazeasca tot ce v-am poruncit. Si iata ca Eu sunt cu voi in toate zilele, pana la sfarsitul veacului.", referinta: "Mat 28:20" },
  // MARCU
  { carte: "Marcu", abreviere: "Mar", testament: "NT", capitol: 9, verset: 23, text: "Isus i-a zis: De ce zici: Daca poti? Toate lucrurile sunt cu putinta pentru cel ce crede.", referinta: "Mar 9:23" },
  { carte: "Marcu", abreviere: "Mar", testament: "NT", capitol: 11, verset: 24, text: "De aceea va spun ca orice lucru veti cere cand va rugati, sa credeti ca l-ati si primit si il veti avea.", referinta: "Mar 11:24" },
  // LUCA
  { carte: "Luca", abreviere: "Luc", testament: "NT", capitol: 1, verset: 37, text: "Caci niciun cuvant din partea lui Dumnezeu nu este lipsit de putere.", referinta: "Luc 1:37" },
  { carte: "Luca", abreviere: "Luc", testament: "NT", capitol: 6, verset: 38, text: "Dati si vi se va da; o masura buna, inghesuita, clatinat si varasata peste masura vi se va turna in san.", referinta: "Luc 6:38" },
  { carte: "Luca", abreviere: "Luc", testament: "NT", capitol: 15, verset: 7, text: "Va spun ca tot asa va fi mai multa bucurie in cer pentru un singur pacatos care se pocaieste decat pentru nouazeci si noua de oameni neprihati.", referinta: "Luc 15:7" },
  // IOAN
  { carte: "Ioan", abreviere: "Ioan", testament: "NT", capitol: 1, verset: 1, text: "La inceput era Cuvantul si Cuvantul era cu Dumnezeu si Cuvantul era Dumnezeu.", referinta: "Ioan 1:1" },
  { carte: "Ioan", abreviere: "Ioan", testament: "NT", capitol: 1, verset: 14, text: "Si Cuvantul S-a facut trup si a locuit printre noi, plin de har si de adevar.", referinta: "Ioan 1:14" },
  { carte: "Ioan", abreviere: "Ioan", testament: "NT", capitol: 3, verset: 16, text: "Fiindca atat de mult a iubit Dumnezeu lumea, ca a dat pe singurul Lui Fiu, pentru ca oricine crede in El sa nu piara, ci sa aiba viata vesnica.", referinta: "Ioan 3:16" },
  { carte: "Ioan", abreviere: "Ioan", testament: "NT", capitol: 3, verset: 17, text: "Dumnezeu, in adevar, n-a trimis pe Fiul Sau in lume ca sa judece lumea, ci ca lumea sa fie mantuita prin El.", referinta: "Ioan 3:17" },
  { carte: "Ioan", abreviere: "Ioan", testament: "NT", capitol: 6, verset: 35, text: "Isus le-a zis: Eu sunt Painea vietii. Cine vine la Mine nu va flamanzi si cine crede in Mine nu va inseta niciodata.", referinta: "Ioan 6:35" },
  { carte: "Ioan", abreviere: "Ioan", testament: "NT", capitol: 8, verset: 12, text: "Eu sunt Lumina lumii. Cine Ma urmeaza pe Mine nu va umbla in intuneric, ci va avea lumina vietii.", referinta: "Ioan 8:12" },
  { carte: "Ioan", abreviere: "Ioan", testament: "NT", capitol: 8, verset: 32, text: "Veti cunoaste adevarul si adevarul va va face liberi.", referinta: "Ioan 8:32" },
  { carte: "Ioan", abreviere: "Ioan", testament: "NT", capitol: 10, verset: 10, text: "Eu am venit ca oile sa aiba viata si s-o aiba din belsug.", referinta: "Ioan 10:10" },
  { carte: "Ioan", abreviere: "Ioan", testament: "NT", capitol: 10, verset: 11, text: "Eu sunt Pastorul cel bun. Pastorul cel bun Isi da viata pentru oi.", referinta: "Ioan 10:11" },
  { carte: "Ioan", abreviere: "Ioan", testament: "NT", capitol: 11, verset: 25, text: "Eu sunt invierea si viata. Cine crede in Mine, chiar daca ar fi murit, va trai.", referinta: "Ioan 11:25" },
  { carte: "Ioan", abreviere: "Ioan", testament: "NT", capitol: 13, verset: 34, text: "Va dau o porunca noua: sa va iubiti unii pe altii; cum v-am iubit Eu, asa sa va iubiti si voi unii pe altii.", referinta: "Ioan 13:34" },
  { carte: "Ioan", abreviere: "Ioan", testament: "NT", capitol: 14, verset: 1, text: "Sa nu vi se tulbure inima. Aveti credinta in Dumnezeu si aveti credinta in Mine.", referinta: "Ioan 14:1" },
  { carte: "Ioan", abreviere: "Ioan", testament: "NT", capitol: 14, verset: 6, text: "Eu sunt Calea, Adevarul si Viata. Nimeni nu vine la Tatal decat prin Mine.", referinta: "Ioan 14:6" },
  { carte: "Ioan", abreviere: "Ioan", testament: "NT", capitol: 14, verset: 27, text: "Va las pacea, va dau pacea Mea. Nu va dau pacea cum v-o da lumea. Sa nu vi se tulbure inima, nici sa nu se inspaimante.", referinta: "Ioan 14:27" },
  { carte: "Ioan", abreviere: "Ioan", testament: "NT", capitol: 15, verset: 5, text: "Eu sunt Vita, voi sunteti mladitele. Cine ramane in Mine si in cine raman Eu aduce multa roada, caci despartiti de Mine nu puteti face nimic.", referinta: "Ioan 15:5" },
  { carte: "Ioan", abreviere: "Ioan", testament: "NT", capitol: 15, verset: 13, text: "Nu este mai mare dragoste decat sa-si dea cineva viata pentru prietenii sai.", referinta: "Ioan 15:13" },
  { carte: "Ioan", abreviere: "Ioan", testament: "NT", capitol: 16, verset: 33, text: "V-am spus aceste lucruri ca sa aveti pace in Mine. In lume veti avea necazuri, dar fiti cu curaj: Eu am biruit lumea.", referinta: "Ioan 16:33" },
  // FAPTELE APOSTOLILOR
  { carte: "Faptele Apostolilor", abreviere: "FA", testament: "NT", capitol: 1, verset: 8, text: "Ci veti primi o putere, cand Se va cobori Duhul Sfant peste voi si Imi veti fi martori in Ierusalim, in toata Iudeea, in Samaria si pana la marginile pamantului.", referinta: "FA 1:8" },
  // ROMANI
  { carte: "Romani", abreviere: "Rom", testament: "NT", capitol: 1, verset: 16, text: "Caci mie nu mi-e rusine de Evanghelia lui Hristos; fiindca ea este puterea lui Dumnezeu pentru mantuirea fiecaruia care crede.", referinta: "Rom 1:16" },
  { carte: "Romani", abreviere: "Rom", testament: "NT", capitol: 5, verset: 8, text: "Dar Dumnezeu Isi arata dragostea fata de noi prin faptul ca, pe cand eram noi inca pacatosi, Hristos a murit pentru noi.", referinta: "Rom 5:8" },
  { carte: "Romani", abreviere: "Rom", testament: "NT", capitol: 6, verset: 23, text: "Fiindca plata pacatului este moartea; dar darul fara plata al lui Dumnezeu este viata vesnica in Isus Hristos, Domnul nostru.", referinta: "Rom 6:23" },
  { carte: "Romani", abreviere: "Rom", testament: "NT", capitol: 8, verset: 1, text: "Acum, dar, nu este nicio osandire pentru cei ce sunt in Hristos Isus.", referinta: "Rom 8:1" },
  { carte: "Romani", abreviere: "Rom", testament: "NT", capitol: 8, verset: 28, text: "De altfel, stim ca toate lucrurile lucreaza impreuna spre binele celor ce iubesc pe Dumnezeu, si anume spre binele celor ce sunt chemati dupa planul Sau.", referinta: "Rom 8:28" },
  { carte: "Romani", abreviere: "Rom", testament: "NT", capitol: 8, verset: 38, text: "Caci sunt sigur ca nici moartea, nici viata, nici ingerii, nici stapanirile nu vor fi in stare sa ne desparta de dragostea lui Dumnezeu.", referinta: "Rom 8:38" },
  { carte: "Romani", abreviere: "Rom", testament: "NT", capitol: 10, verset: 9, text: "Daca marturisesti deci cu gura ta pe Isus ca Domn si daca crezi in inima ta ca Dumnezeu L-a inviat din morti, vei fi mantuit.", referinta: "Rom 10:9" },
  { carte: "Romani", abreviere: "Rom", testament: "NT", capitol: 12, verset: 2, text: "Sa nu va potriviti chipului veacului acestuia, ci sa va prefaceti prin innoirea mintii voastre, ca sa puteti deosebi bine voia lui Dumnezeu: cea buna, placuta si desavarsita.", referinta: "Rom 12:2" },
  { carte: "Romani", abreviere: "Rom", testament: "NT", capitol: 15, verset: 13, text: "Dumnezeul nadejdii sa va umple de toata bucuria si pacea, ca sa sporiti in nadejde, prin puterea Duhului Sfant.", referinta: "Rom 15:13" },
  // 1 CORINTENI
  { carte: "1 Corinteni", abreviere: "1Cor", testament: "NT", capitol: 10, verset: 13, text: "Nu v-a ajuns nicio ispita care sa nu fi fost potrivita cu puterea omeneasca. Si Dumnezeu, care este credincios, nu va ingadui sa fiti ispititi peste puterile voastre.", referinta: "1Cor 10:13" },
  { carte: "1 Corinteni", abreviere: "1Cor", testament: "NT", capitol: 13, verset: 4, text: "Dragostea este indelung rabdatoare, este plina de bunatate; dragostea nu invidiaza; dragostea nu se lauda, nu se umfla de mandrie.", referinta: "1Cor 13:4" },
  { carte: "1 Corinteni", abreviere: "1Cor", testament: "NT", capitol: 13, verset: 7, text: "Acopera totul, crede totul, nadajduieste totul, sufera totul.", referinta: "1Cor 13:7" },
  { carte: "1 Corinteni", abreviere: "1Cor", testament: "NT", capitol: 13, verset: 8, text: "Dragostea nu va pieri niciodata.", referinta: "1Cor 13:8" },
  { carte: "1 Corinteni", abreviere: "1Cor", testament: "NT", capitol: 13, verset: 13, text: "Acum deci raman acestea trei: credinta, nadejdea si dragostea; dar cea mai mare dintre ele este dragostea.", referinta: "1Cor 13:13" },
  // 2 CORINTENI
  { carte: "2 Corinteni", abreviere: "2Cor", testament: "NT", capitol: 5, verset: 17, text: "Caci daca este cineva in Hristos, este o faptura noua. Cele vechi s-au dus: iata ca toate lucrurile s-au facut noi.", referinta: "2Cor 5:17" },
  { carte: "2 Corinteni", abreviere: "2Cor", testament: "NT", capitol: 9, verset: 8, text: "Si Dumnezeu poate sa va dea din belsug orice har, pentru ca, avand totdeauna in toate lucrurile destul, sa prisos ati in orice fapta buna.", referinta: "2Cor 9:8" },
  { carte: "2 Corinteni", abreviere: "2Cor", testament: "NT", capitol: 12, verset: 9, text: "Si El mi-a zis: Harul Meu iti este de ajuns; caci puterea Mea in slabiciune este facuta desavarsita.", referinta: "2Cor 12:9" },
  // GALATENI
  { carte: "Galateni", abreviere: "Gal", testament: "NT", capitol: 5, verset: 22, text: "Dar rodul Duhului este: dragostea, bucuria, pacea, indelunga rabdare, bunatatea, facerea de bine, credinciosia.", referinta: "Gal 5:22" },
  { carte: "Galateni", abreviere: "Gal", testament: "NT", capitol: 5, verset: 23, text: "Blandetea, infranarea poftelor. Impotriva acestor lucruri nu este lege.", referinta: "Gal 5:23" },
  // EFESENI
  { carte: "Efeseni", abreviere: "Ef", testament: "NT", capitol: 2, verset: 8, text: "Caci prin har ati fost mantuiti, prin credinta. Si aceasta nu vine de la voi; ci este darul lui Dumnezeu.", referinta: "Ef 2:8" },
  { carte: "Efeseni", abreviere: "Ef", testament: "NT", capitol: 2, verset: 10, text: "Caci noi suntem lucrarea Lui si am fost ziditi in Hristos Isus pentru faptele bune pe care le-a pregatit Dumnezeu mai dinainte.", referinta: "Ef 2:10" },
  { carte: "Efeseni", abreviere: "Ef", testament: "NT", capitol: 3, verset: 20, text: "Iar a Celui ce, prin puterea care lucreaza in noi, poate sa faca nespus mai mult decat tot ce cerem sau gandim noi.", referinta: "Ef 3:20" },
  { carte: "Efeseni", abreviere: "Ef", testament: "NT", capitol: 6, verset: 11, text: "Imbracati-va cu toata armatura lui Dumnezeu, ca sa puteti tine piept impotriva uneltirilor diavolului.", referinta: "Ef 6:11" },
  // FILIPENI
  { carte: "Filipeni", abreviere: "Fil", testament: "NT", capitol: 4, verset: 4, text: "Bucurati-va intotdeauna in Domnul! Iarasi zic: Bucurati-va!", referinta: "Fil 4:4" },
  { carte: "Filipeni", abreviere: "Fil", testament: "NT", capitol: 4, verset: 6, text: "Nu va ingrijorati de nimic; ci, in orice lucru, aduceti cererile voastre la cunostinta lui Dumnezeu, prin rugaciuni si cereri, cu multumiri.", referinta: "Fil 4:6" },
  { carte: "Filipeni", abreviere: "Fil", testament: "NT", capitol: 4, verset: 7, text: "Si pacea lui Dumnezeu, care intrece orice pricepere, va va pazi inimile si gandurile in Hristos Isus.", referinta: "Fil 4:7" },
  { carte: "Filipeni", abreviere: "Fil", testament: "NT", capitol: 4, verset: 8, text: "Tot ce este adevarat, tot ce este vrednic de cinste, tot ce este drept, tot ce este curat, tot ce este vrednic de iubit, tot ce este vrednic de primit, orice fapta buna si orice lauda, aceea sa va indeletniceasca gandurile.", referinta: "Fil 4:8" },
  { carte: "Filipeni", abreviere: "Fil", testament: "NT", capitol: 4, verset: 13, text: "Pot totul in Hristos, care ma intareste.", referinta: "Fil 4:13" },
  { carte: "Filipeni", abreviere: "Fil", testament: "NT", capitol: 4, verset: 19, text: "Si Dumnezeul meu sa ingrijeasca de toate trebuintele voastre, dupa bogatia Sa, in slava, in Hristos Isus.", referinta: "Fil 4:19" },
  // COLOSENI
  { carte: "Coloseni", abreviere: "Col", testament: "NT", capitol: 3, verset: 15, text: "Si pacea lui Hristos, la care ati fost chemati intr-un singur trup, sa stapaneasca in inimile voastre.", referinta: "Col 3:15" },
  { carte: "Coloseni", abreviere: "Col", testament: "NT", capitol: 3, verset: 17, text: "Si orice faceti, cu cuvantul sau cu fapta, sa faceti totul in Numele Domnului Isus si multumiti lui Dumnezeu Tatal prin El.", referinta: "Col 3:17" },
  // 1 TESALONICENI
  { carte: "1 Tesaloniceni", abreviere: "1Tes", testament: "NT", capitol: 5, verset: 16, text: "Bucurati-va intotdeauna.", referinta: "1Tes 5:16" },
  { carte: "1 Tesaloniceni", abreviere: "1Tes", testament: "NT", capitol: 5, verset: 17, text: "Rugati-va fara incetare.", referinta: "1Tes 5:17" },
  { carte: "1 Tesaloniceni", abreviere: "1Tes", testament: "NT", capitol: 5, verset: 18, text: "Multumiti lui Dumnezeu pentru toate lucrurile; caci aceasta este voia lui Dumnezeu, in Hristos Isus, cu privire la voi.", referinta: "1Tes 5:18" },
  // 2 TIMOTEI
  { carte: "2 Timotei", abreviere: "2Tim", testament: "NT", capitol: 1, verset: 7, text: "Caci Dumnezeu nu ne-a dat un duh de frica, ci de putere, de dragoste si de cumpatare.", referinta: "2Tim 1:7" },
  { carte: "2 Timotei", abreviere: "2Tim", testament: "NT", capitol: 3, verset: 16, text: "Toata Scriptura este insuflata de Dumnezeu si de folos ca sa invete, sa mustre, sa indrepte, sa dea intelepciune in neprihanie.", referinta: "2Tim 3:16" },
  // EVREI
  { carte: "Evrei", abreviere: "Evr", testament: "NT", capitol: 11, verset: 1, text: "Si credinta este o incredere neclintita in lucrurile nadajduite, o puternica incredintare despre lucrurile care nu se vad.", referinta: "Evr 11:1" },
  { carte: "Evrei", abreviere: "Evr", testament: "NT", capitol: 11, verset: 6, text: "Si fara credinta este cu neputinta sa fim placuti Lui! Caci cine se apropie de Dumnezeu trebuie sa creada ca El exista si ca rasplateste pe cei ce Il cauta.", referinta: "Evr 11:6" },
  { carte: "Evrei", abreviere: "Evr", testament: "NT", capitol: 12, verset: 1, text: "Sa dam la o parte orice piedica si pacatul care ne infasoara asa de lesne si sa alergam cu staruinta in alergarea care ne sta inainte.", referinta: "Evr 12:1" },
  { carte: "Evrei", abreviere: "Evr", testament: "NT", capitol: 13, verset: 8, text: "Isus Hristos este acelasi ieri si azi si in veci!", referinta: "Evr 13:8" },
  // IACOV
  { carte: "Iacov", abreviere: "Iac", testament: "NT", capitol: 1, verset: 2, text: "Fratii mei, sa priviti ca o mare bucurie cand treceti prin felurite incercari.", referinta: "Iac 1:2" },
  { carte: "Iacov", abreviere: "Iac", testament: "NT", capitol: 1, verset: 5, text: "Daca vreunuia dintre voi ii lipseste intelepciunea, s-o ceara de la Dumnezeu, care da tuturor cu mana larga si fara mustrare, si ea ii va fi data.", referinta: "Iac 1:5" },
  { carte: "Iacov", abreviere: "Iac", testament: "NT", capitol: 4, verset: 7, text: "Supuneti-va deci lui Dumnezeu. Impotriviti-va diavolului si el va fugi de la voi.", referinta: "Iac 4:7" },
  { carte: "Iacov", abreviere: "Iac", testament: "NT", capitol: 5, verset: 16, text: "Marturisiti-va unii altora pacatele si rugati-va unii pentru altii, ca sa fiti vindecati. Mare putere are rugaciunea fierbinte a celui drept.", referinta: "Iac 5:16" },
  // 1 PETRU
  { carte: "1 Petru", abreviere: "1Pet", testament: "NT", capitol: 5, verset: 7, text: "Si aruncati asupra Lui toata ingrijorarea voastra, caci El insusi ingrijeste de voi.", referinta: "1Pet 5:7" },
  // 1 IOAN
  { carte: "1 Ioan", abreviere: "1Ioan", testament: "NT", capitol: 1, verset: 9, text: "Daca ne marturisim pacatele, El este credincios si drept ca sa ne ierte pacatele si sa ne curateasca de orice nedreptate.", referinta: "1Ioan 1:9" },
  { carte: "1 Ioan", abreviere: "1Ioan", testament: "NT", capitol: 4, verset: 7, text: "Preaiubitilor, sa ne iubim unii pe altii; caci dragostea este de la Dumnezeu. Si oricine iubeste este nascut din Dumnezeu si cunoaste pe Dumnezeu.", referinta: "1Ioan 4:7" },
  { carte: "1 Ioan", abreviere: "1Ioan", testament: "NT", capitol: 4, verset: 8, text: "Cine nu iubeste n-a cunoscut pe Dumnezeu; pentru ca Dumnezeu este dragoste.", referinta: "1Ioan 4:8" },
  { carte: "1 Ioan", abreviere: "1Ioan", testament: "NT", capitol: 4, verset: 19, text: "Noi Il iubim pe El pentru ca El ne-a iubit cel dintai.", referinta: "1Ioan 4:19" },
  // APOCALIPSA
  { carte: "Apocalipsa", abreviere: "Apoc", testament: "NT", capitol: 3, verset: 20, text: "Iata Eu stau la usa si bat. Daca aude cineva glasul Meu si deschide usa, voi intra la el, voi cina cu el si el cu Mine.", referinta: "Apoc 3:20" },
  { carte: "Apocalipsa", abreviere: "Apoc", testament: "NT", capitol: 21, verset: 4, text: "El va sterge orice lacrima din ochii lor. Si moartea nu va mai fi. Nu va mai fi nici tanguire, nici tipat, nici durere, pentru ca lucrurile dintai au trecut.", referinta: "Apoc 21:4" },
  { carte: "Apocalipsa", abreviere: "Apoc", testament: "NT", capitol: 22, verset: 20, text: "Cel ce adevereaza aceste lucruri zice: Da, Eu vin curand. Amin! Vino, Doamne Isuse!", referinta: "Apoc 22:20" }
];

// Salveaza ca JSON simplu (array de versete)
const outputPath = path.join(__dirname, '../data/versete_complete.json');
fs.writeFileSync(outputPath, JSON.stringify(verseteComplete, null, 2), 'utf8');

console.log(`✅ Generat ${verseteComplete.length} versete!`);
console.log(`💾 Salvat in: ${outputPath}`);

// Statistici
const vt = verseteComplete.filter(v => v.testament === 'VT').length;
const nt = verseteComplete.filter(v => v.testament === 'NT').length;
const carti = [...new Set(verseteComplete.map(v => v.carte))];

console.log(`\n📊 Statistici:`);
console.log(`   Testament Vechi: ${vt} versete`);
console.log(`   Testament Nou: ${nt} versete`);
console.log(`   Carti acoperite: ${carti.length}`);
console.log(`\n📚 Carti:`);
carti.forEach(c => {
  const count = verseteComplete.filter(v => v.carte === c).length;
  console.log(`   ${c}: ${count} versete`);
});