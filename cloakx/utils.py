import logging

class Color:
    """Colorify class."""
    colors = {
        "normal"         : "\033[0m\033[49m",
        "gray"           : "\033[1;30m",
        "red"            : "\033[31m",
        "green"          : "\033[32m",
        "yellow"         : "\033[33m",
        "blue"           : "\033[34m",
        "pink"           : "\033[35m",
        "white"          : "\033[1;37m",
        "bold"           : "\033[1m",
        "underline"      : "\033[4m",
        "underline_off"  : "\033[24m",
        "highlight"      : "\033[3m",
        "highlight_off"  : "\033[23m",
        "blink"          : "\033[5m",
        "blink_off"      : "\033[25m",
    }

    @staticmethod
    def redify(msg):
        return Color.colorify(msg, attrs="bold red")

    @staticmethod
    def greenify(msg):
        return Color.colorify(msg, attrs="bold green")

    @staticmethod
    def blueify(msg):
        return Color.colorify(msg, attrs="bold blue")

    @staticmethod
    def yellowify(msg):
        return Color.colorify(msg, attrs="bold yellow")

    @staticmethod
    def grayify(msg):
        return Color.colorify(msg, attrs="bold gray")

    @staticmethod
    def pinkify(msg):
        return Color.colorify(msg, attrs="bold pink")

    @staticmethod
    def whiteify(msg):
        return Color.colorify(msg, attrs="bold white")

    @staticmethod
    def boldify(msg):
        return Color.colorify(msg, attrs="bold")

    @staticmethod
    def underlinify(msg):
        return Color.colorify(msg, attrs="underline")

    @staticmethod
    def highlightify(msg):
        return Color.colorify(msg, attrs="highlight")

    @staticmethod
    def colorify(text, attrs):
        """Color a text following the given attributes."""
        colors = Color.colors
        msg = [colors[attr] for attr in attrs.split() if attr in colors]
        msg.append(text)

        if colors["highlight"] in msg:
            msg.append(colors["highlight_off"])
        if colors["underline"] in msg:
            msg.append(colors["underline_off"])
        if colors["blink"] in msg:
            msg.append(colors["blink_off"])

        msg.append(colors["normal"])

        return "".join(msg)
#
# class Color:
#
#     # [30m--set foreground color to black
#     # [31m--set foreground color to red
#     BOLD_RED = '\033[1;31m'
#     FAIL_COLOR = '\033[1;31m'
#     # [32m--set foreground color to green
#     BOLD_GREEN = '\033[1;32m'
#     UP_COLOR = BOLD_GREEN
#
#
# # [33m--set foreground color to yellow
# # [34m--set foreground color to blue
# # [35m--set foreground color to magenta (purple)
# # [36m--set foreground color to cyan
# # [37m--set foreground color to white
#     BOLD_WHITE = '\033[1;37m'
# # [39m--set foreground color to default (white)
#
# # [40m--set background color to black
# # [41m--set background color to red
# # [42m--set background color to green
# # [43m--set background color to yellow
# # [44m--set background color to blue
# # [45m--set background color to magenta (purple)
# # [46m--set background color to cyan
# # [47m--set background color to white
# # [49m set background color to default (black)
#
#     NONE = '\033[0m\033[49m'
#
#     @staticmethod
#     def whiteify(str_to_decorate):
#         return "%s%s%s" % (Color.BOLD_WHITE, str_to_decorate, Color.NONE)
#
#     @staticmethod
#     def greenify(str_to_decorate):
#         return "%s%s%s" % (Color.BOLD_GREEN, str_to_decorate, Color.NONE)

loggers = {}


def log_factory(log_name, log_level='INFO', log_fn=None, format=None):
    import coloredlogs
    global loggers
    # logging.basicConfig(level=logging.ERROR)
    if loggers.get(log_name):
        return loggers.get(log_name)
    else:

        log = logging.getLogger(log_name)
        coloredlogs.install(level=log_level)
        # log.setLevel(LOGGING_LEVEL)
        # log_formatter = coloredlogs.ColoredFormatter(COLORED_LOG_FMT)
        # log_handler = logging.StreamHandler()
        # log_handler.setFormatter(log_formatter)
        # log.addHandler(log_handler)
        if log_fn is not None:
            fileHandler = logging.FileHandler("/var/log/" + log_fn)
            if format is not None:
                formatter = logging.Formatter(format)
                fileHandler.setFormatter(formatter)
            log.addHandler(fileHandler)
        loggers.update(dict(name=log))
        #print("creating logger {} {} ".format(log_name, loggers.get(log_name)))


    return log


def set_loglevel(mod_names, log_level):
    for log_name in mod_names:
        logging.getLogger(log_name).setLevel(log_level)

# Squelch noisy logs
auto_squelch = ()

set_loglevel(auto_squelch, logging.ERROR)


def multi_open(filename, open_params='r'):
    encoding = 'utf-8'
    try:
        filepointer = open(filename, open_params, encoding=encoding)
    except UnicodeDecodeError as ude:
        try:
            encoding = 'latin-1'
            filepointer = open(filename, open_params, encoding=encoding)
        except:
            raise Exception("failed to open {}".format(filename))
    return filepointer
