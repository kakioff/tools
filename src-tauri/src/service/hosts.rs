#[allow(dead_code)]
pub async fn update_hosts() {
    let content = get_github_hosts().await;

    // 修改hosts部分为# github hosts到# end github hosts之间的内容, 没有的话就新建
    let mut hosts = get_hosts();
    let start = hosts.find("# start github hosts").unwrap_or(0);
    let end = hosts.find("# end github hosts").unwrap_or(0);
    if start == 0 {
        hosts.push_str("# start github hosts\n");
        hosts.push_str(&content);
        hosts.push_str("\n# end github hosts\n");
    } else {
        hosts.replace_range(
            start..end,
            format!("# start github hosts\n{}", content).as_str(),
        );
    }
    std::fs::write(get_hosts_path(), hosts).unwrap();
}
#[allow(dead_code)]
pub async fn get_github_hosts() -> String {
    let req = reqwest::get("https://github-hosts.tinsfox.com/hosts")
        .await
        .unwrap();
    req.text().await.unwrap()
}
#[allow(dead_code)]
pub fn get_hosts_path() -> String {
    "c:\\Windows\\System32\\drivers\\etc\\hosts".to_string()
}
#[allow(dead_code)]
pub fn get_hosts() -> String {
    let hosts = std::fs::read_to_string(get_hosts_path()).unwrap();
    hosts
}
