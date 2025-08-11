import csv, subprocess, time, sys, os

src, dst = sys.argv[1], sys.argv[2]
now = int(time.time())
rows=[]

with open(src, newline='') as f:
    r = csv.reader(f)
    for file,line,tag,summary in r:
        try:
            p = subprocess.run(
                ["git","blame","-L",f"{line},{line}","--line-porcelain",file],
                capture_output=True, text=True, check=True)
            au, ts = "(unknown)", 0
            for ln in p.stdout.splitlines():
                if ln.startswith("author "): au = ln[len("author "):]
                if ln.startswith("author-time "): ts = int(ln[len("author-time "):])
            age_days = (now - ts)//86400 if ts else ""
        except Exception:
            au, age_days = "(unknown)", ""
        rows.append([file,line,tag,age_days,au,summary])

with open(dst,"w",newline='') as f:
    w=csv.writer(f)
    w.writerow(["file","line","tag","age_days","author","summary"])
    w.writerows(rows)
