import subprocess
import os
import shutil
import argparse

buildDir = "./"
pluginPathFromRoot = ".obsidian/plugins"
buildCmd = "npm run build"
pluginName = "auto-glossary"
deployableFilenames = ["styles.css", "main.js", "manifest.json"]

parser = argparse.ArgumentParser()
parser.add_argument("-ovp", "--obsidianVaultPath", help="Path used to indicate the obsidian root vault directory")
parser.add_argument("-b", "--buildDir", default=buildDir, help="The build directory path")

args = parser.parse_args()
obsidianVaultPath = args.obsidianVaultPath
buildDir = args.buildDir

# Checks to ensure the directory for the package temp build location exists
# TODO: This should go away once the build properly packages the built files into the correct directory
packageDir = buildDir + pluginName
packageDirExists = os.path.isdir(packageDir)
if (not packageDirExists):
    os.makedirs(packageDir)

process = subprocess.Popen(buildCmd, shell=True)
process.communicate()

# Copy the built files to the install path
for filename in deployableFilenames:
    shutil.copy(buildDir + filename, packageDir)

# Checks to make sure the plugins folder exists
obsidianPluginPath = obsidianVaultPath + "/" + pluginPathFromRoot
obsidianPluginExists = os.path.isdir(obsidianPluginPath)
if (obsidianPluginExists):
    shutil.rmtree(obsidianPluginPath)

# Checks to ensure the ato=glossary plugin plugin folder exists
obsidianAutoGlossaryPath = obsidianPluginPath + "/" + pluginName
obsidianAutoGlossaryExists = os.path.isdir(obsidianAutoGlossaryPath)
if (obsidianAutoGlossaryExists):
    shutil.rmtree(obsidianAutoGlossaryPath)

# Moves the obsidian-auto-glossary plugin package to plugin path
print("\nDeploying package to " + obsidianAutoGlossaryPath)
print("\nSuccessfully deployed package.")
shutil.move(packageDir, obsidianAutoGlossaryPath)