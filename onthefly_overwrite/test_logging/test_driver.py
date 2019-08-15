#!/usr/bin/env python
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import os
import time
from pyvirtualdisplay import Display

display = Display(visible=0, size=(1920, 1200))
display.start()

EXT = os.path.abspath("./mloajfnmjckfjbeeofcdaecbelnblden2.crx")
#EXT = os.path.abspath("./mloajfnmjckfjbeeofcdaecbelnblden.crx")
#EXT = os.path.abspath("./mloajfnmjckfjbeeofcdaecbelnblden_3_5_1_1.crx")
#EXT = os.path.abspath("./hoaghoddfoiocckakhkkfgmjhieinlbf_0_2_2.crx")
LOG = os.path.abspath("./chrome_log.txt")

d = DesiredCapabilities.CHROME
d['loggingPrefs'] = { 'browser':'ALL' }
chop = webdriver.ChromeOptions()
chop.add_argument("start-maximized")
chop.add_extension(EXT)

#driver = webdriver.Chrome(chrome_options=chop, service_args=["--verbose", "--log-path=" + LOG])
driver = webdriver.Chrome(chrome_options=chop, desired_capabilities=d)
driver.set_page_load_timeout(20)                    
driver.set_script_timeout(20)
driver.implicitly_wait(5)
driver.set_window_size(1920, 1200)

time.sleep(5)

driver.get("https://en.wikipedia.org/wiki/Spacetime")

time.sleep(10)

for entry in driver.get_log('browser'):
    print entry


driver.quit()
display.stop()



