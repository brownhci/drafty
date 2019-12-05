import * as shell from "shelljs";

//shell.cp("-R", "src/public/js/lib", "dist/public/js/"); // from original
shell.cp("-R", "src/public/js/clusterize/", "dist/public/js/clusterize/");
shell.cp("-R", "src/public/fonts", "dist/public/");
shell.cp("-R", "src/public/webfonts", "dist/public/");
shell.cp("-R", "src/public/images", "dist/public/");
