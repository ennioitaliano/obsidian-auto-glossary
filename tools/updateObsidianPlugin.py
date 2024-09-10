import subprocess
import os
import shutil
import argparse

buildDir = "./auto-glossary"
buildCmd = "npm run build"

parser = argparse.ArgumentParser()
parser.add_argument("-p", "--path", default=buildDir, help="Path used to indicate the obsidian auto-glossary plugin directory location")

args = parser.parse_args()
obsidianPath = args.path

buildDirExists = os.path.isdir(buildDir)
if (not buildDirExists):
    os.makedirs(buildDir)

process = subprocess.Popen(buildCmd, shell=True)
process.communicate()

shutil.copy("../styles.css", buildDir)
shutil.copy("../main.js", buildDir)
shutil.copy("../manifest.json", buildDir)

shutil.move(buildDir, obsidianPath)